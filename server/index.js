import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// ─── Room state ───────────────────────────────────────────
// rooms Map: roomId → { roomId, users[], hostId, mode }
// user: { id (socket.id), userId (persistent UUID), name, color }
const rooms = new Map();

function generateRoomId() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getRoomForSocket(socketId) {
  for (const [roomId, room] of rooms) {
    if (room.users.some((u) => u.id === socketId)) return room;
  }
  return null;
}

function broadcastRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  io.to(roomId).emit("roomState", {
    roomId: room.roomId,
    users: room.users.map((u) => ({ userId: u.userId, name: u.name, color: u.color })),
    hostId: room.hostId,
    mode: room.mode,
  });
}

// ─── Socket.IO events ─────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // ── Create room ──
  socket.on("createRoom", ({ userId, name, color }) => {
    // Leave any current room first
    const existing = getRoomForSocket(socket.id);
    if (existing) {
      socket.leave(existing.roomId);
      existing.users = existing.users.filter((u) => u.id !== socket.id);
      if (existing.users.length === 0) rooms.delete(existing.roomId);
      else {
        if (existing.hostId === userId) existing.hostId = existing.users[0].userId;
        broadcastRoomState(existing.roomId);
      }
    }

    const roomId = generateRoomId();
    const room = {
      roomId,
      users: [{ id: socket.id, userId, name, color }],
      hostId: userId,
      mode: "shared",
      strokes: [],
      currentStrokes: {},
      stickies: {},
      history: [],    // undo stack — each entry is JSON.stringify(strokes)
      redoStack: []   // redo stack
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit("roomCreated", { roomId });
    broadcastRoomState(roomId);
    console.log(`[createRoom] ${name} created ${roomId}`);
  });

  // ── Join room ──
  socket.on("joinRoom", ({ roomId, userId, name, color }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    if (room.users.length >= 5) {
      socket.emit("error", { message: "Room is full (max 5 users)" });
      return;
    }
    // Check if already in this room (reconnecting)
    const existingIdx = room.users.findIndex((u) => u.userId === userId);
    if (existingIdx !== -1) {
      room.users[existingIdx].id = socket.id; // update socket ID
    } else {
      room.users.push({ id: socket.id, userId, name, color });
    }
    socket.join(roomId);
    socket.emit("joinedRoom", { roomId });
    broadcastRoomState(roomId);
    socket.to(roomId).emit("userJoined", { userId, name, color });

    // Instantly feed new connection the authoritative canvas state
    socket.emit("init-canvas", { 
      strokes: room.strokes, 
      stickies: Object.values(room.stickies || {})
    });

    console.log(`[joinRoom] ${name} joined ${roomId} (${room.users.length}/5)`);
  });

  // ── Rejoin room (reconnection) ──
  socket.on("rejoinRoom", ({ roomId, userId, name, color }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room no longer exists" });
      return;
    }
    const existingIdx = room.users.findIndex((u) => u.userId === userId);
    if (existingIdx !== -1) {
      room.users[existingIdx].id = socket.id;
    } else if (room.users.length < 5) {
      room.users.push({ id: socket.id, userId, name, color });
    } else {
      socket.emit("error", { message: "Room is full" });
      return;
    }
    socket.join(roomId);
    socket.emit("joinedRoom", { roomId });
    broadcastRoomState(roomId);

    // Provide the active canvas state instantly upon reconnection
    socket.emit("init-canvas", { 
      strokes: room.strokes, 
      stickies: Object.values(room.stickies || {}) 
    });

    console.log(`[rejoinRoom] ${name} rejoined ${roomId}`);
  });

  // ── Leave room ──
  socket.on("leaveRoom", () => {
    handleLeave(socket);
  });

  // ─── Stroke Lifecycle (Incremental) ───
  socket.on("stroke:start", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    const userId = data.userId || room.users.find(u => u.id === socket.id)?.userId;
    if (!userId) return;

    room.currentStrokes[data.strokeId] = {
      ...data,
      userId,
      segments: [] // only pen/pencil use segments; shapes use stroke:end directly
    };

    socket.to(room.roomId).emit("stroke:start", { ...data, userId });
    console.log(`[stroke:start] ${data.strokeId} tool=${data.tool} by ${userId}`);
  });

  socket.on("stroke:update", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    
    const stroke = room.currentStrokes[data.strokeId];
    if (stroke) {
      stroke.segments.push(data);
    }

    socket.to(room.roomId).emit("stroke:update", data);
  });

  socket.on("stroke:end", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;

    // Shapes: treat as final objects, push directly and broadcast full state
    if (data.isShape) {
      const userId = data.userId || room.users.find(u => u.id === socket.id)?.userId;
      if (!userId) return;
      // Snapshot before mutation
      room.history.push(JSON.stringify(room.strokes));
      if (room.history.length > 50) room.history.shift();
      room.redoStack = [];
      room.strokes.push({ ...data, userId });
      delete room.currentStrokes[data.strokeId];
      io.to(room.roomId).emit("init-canvas", {
        strokes: room.strokes,
        stickies: Object.values(room.stickies || {})
      });
      console.log(`[stroke:end/shape] ${data.strokeId}`);
      return;
    }

    const stroke = room.currentStrokes[data.strokeId];
    if (stroke) {
      // Guarantee userId is always set on every stored stroke
      if (!stroke.userId) {
        stroke.userId = data.userId || room.users.find(u => u.id === socket.id)?.userId;
      }
      // Snapshot before mutation
      room.history.push(JSON.stringify(room.strokes));
      if (room.history.length > 50) room.history.shift();
      room.redoStack = [];
      room.strokes.push(stroke);
      delete room.currentStrokes[data.strokeId];
      // Broadcast full state to ensure everyone is synced to the authoritative version
      io.to(room.roomId).emit("init-canvas", {
        strokes: room.strokes,
        stickies: Object.values(room.stickies || {})
      });
    } else {
      socket.to(room.roomId).emit("stroke:end", data);
    }
    console.log(`[stroke:end] ${data.strokeId}`);
  });

  // ── Erase event (path/region based) ──
  socket.on("erase", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    const { mode } = data;
    const THRESHOLD = 14;

    // Helper: collect all points from a stroke
    function strokePoints(stroke) {
      const pts = [];
      if (stroke.x !== undefined) pts.push({ x: stroke.x, y: stroke.y });
      (stroke.segments || []).forEach(seg => {
        if (seg.x !== undefined) pts.push({ x: seg.x, y: seg.y });
        if (seg.points) seg.points.forEach(p => pts.push(p));
      });
      if (stroke.startX !== undefined) pts.push({ x: stroke.startX, y: stroke.startY });
      if (stroke.endX !== undefined) pts.push({ x: stroke.endX, y: stroke.endY });
      return pts;
    }

    // Helper: point-in-polygon (ray casting)
    function pointInPolygon(px, py, poly) {
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    const before = JSON.stringify(room.strokes);

    const filtered = room.strokes.filter(stroke => {
      const pts = strokePoints(stroke);
      if (pts.length === 0) return true;

      // Add intermediate points along shape edges
      const allPts = [...pts];
      if (stroke.isShape && stroke.startX !== undefined && stroke.endX !== undefined) {
        for (let i = 1; i < 20; i++) {
          const t = i / 20;
          allPts.push({
            x: stroke.startX + (stroke.endX - stroke.startX) * t,
            y: stroke.startY + (stroke.endY - stroke.startY) * t
          });
        }
      }

      if (mode === "freehand") {
        const path = data.path || [];
        for (const ep of path) {
          for (const sp of allPts) {
            if (Math.hypot(sp.x - ep.x, sp.y - ep.y) < THRESHOLD) return false;
          }
        }
      } else if (mode === "lasso") {
        const poly = data.polygon || [];
        if (poly.length < 3) return true;
        for (const sp of allPts) {
          if (pointInPolygon(sp.x, sp.y, poly)) return false;
        }
      } else if (mode === "rect") {
        const r = data.rect;
        if (!r) return true;
        const minX = Math.min(r.x, r.x + r.w), maxX = Math.max(r.x, r.x + r.w);
        const minY = Math.min(r.y, r.y + r.h), maxY = Math.max(r.y, r.y + r.h);
        for (const sp of allPts) {
          if (sp.x >= minX && sp.x <= maxX && sp.y >= minY && sp.y <= maxY) return false;
        }
      }
      return true;
    });

    if (JSON.stringify(filtered) !== before) {
      room.history.push(before);
      if (room.history.length > 50) room.history.shift();
      room.redoStack = [];
      room.strokes = filtered;
    }

    io.to(room.roomId).emit("init-canvas", {
      strokes: room.strokes,
      stickies: Object.values(room.stickies || {})
    });
    console.log(`[erase/${mode}]`);
  });

  // ── Segment-level erase (real-time) ──
  socket.on("eraseSegment", ({ strokeId, userId, x, y, radius }) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;

    let changed = false;
    // NOTE: We do NOT snapshot history here because it fires 60fps and would kill performance.
    // History is snapshotted in the batch 'erase' event on mouseup.
    room.strokes = room.strokes.map(stroke => {
      const prevLen = (stroke.segments || []).length;
      stroke.segments = (stroke.segments || []).filter(pt => {
        const dx = (pt.x ?? 0) - x;
        const dy = (pt.y ?? 0) - y;
        return Math.sqrt(dx * dx + dy * dy) > radius;
      });
      if (stroke.segments.length !== prevLen) changed = true;
      return stroke;
    });

    if (changed) {
      // Clear redo since state changed
      room.redoStack = [];
      io.to(room.roomId).emit("init-canvas", {
        strokes: room.strokes,
        stickies: Object.values(room.stickies || {})
      });
    }
  });

  // ── Pan sync ──
  socket.on("panMove", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    socket.to(room.roomId).emit("panMove", data);
  });

  socket.on("requestCanvasState", () => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    socket.emit("init-canvas", { 
      strokes: room.strokes, 
      stickies: Object.values(room.stickies || {}) 
    });
  });

  // ── Undo ──
  socket.on("undo", () => {
    const room = getRoomForSocket(socket.id);
    if (!room || room.history.length === 0) return;
    room.redoStack.push(JSON.stringify(room.strokes));
    room.strokes = JSON.parse(room.history.pop());
    io.to(room.roomId).emit("init-canvas", {
      strokes: room.strokes,
      stickies: Object.values(room.stickies || {})
    });
  });

  // ── Redo ──
  socket.on("redo", () => {
    const room = getRoomForSocket(socket.id);
    if (!room || room.redoStack.length === 0) return;
    room.history.push(JSON.stringify(room.strokes));
    room.strokes = JSON.parse(room.redoStack.pop());
    io.to(room.roomId).emit("init-canvas", {
      strokes: room.strokes,
      stickies: Object.values(room.stickies || {})
    });
  });

  socket.on("clearCanvas", () => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;

    room.history.push(JSON.stringify(room.strokes));
    if (room.history.length > 50) room.history.shift();
    room.redoStack = [];
    room.strokes = [];
    room.currentStrokes = {};

    io.to(room.roomId).emit("init-canvas", {
      strokes: [],
      stickies: Object.values(room.stickies || {})
    });
    console.log(`[clearCanvas] room cleared`);
  });

  // ── Sticky note operations ──
  socket.on("stickyAdd", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    if (!room.stickies) room.stickies = {};
    room.stickies[data.id] = data;
    socket.to(room.roomId).emit("stickyAdd", data);
  });

  socket.on("stickyMove", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    if (room.stickies[data.id]) Object.assign(room.stickies[data.id], data);
    socket.to(room.roomId).emit("stickyMove", data);
  });

  socket.on("stickyDelete", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    if (room.stickies[data.id]) delete room.stickies[data.id];
    socket.to(room.roomId).emit("stickyDelete", data);
  });

socket.on("stickyText", (data) => {
  const room = getRoomForSocket(socket.id);
  if (!room) return;
  if (room.stickies[data.id]) {
    room.stickies[data.id].text = data.text;
  }
  socket.to(room.roomId).emit("stickyText", data);
});

  socket.on("stickyColor", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    if (room.stickies[data.id]) room.stickies[data.id].color = data.color;
    socket.to(room.roomId).emit("stickyColor", data);
  });

  // ── Change mode (host only) ──
  socket.on("changeMode", ({ mode }) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    const user = room.users.find((u) => u.id === socket.id);
    if (!user || user.userId !== room.hostId) {
      socket.emit("error", { message: "Only the host can change mode" });
      return;
    }
    room.mode = mode;
    io.to(room.roomId).emit("modeChanged", { mode });
    broadcastRoomState(room.roomId);
    console.log(`[changeMode] ${room.roomId} → ${mode}`);
  });

  // ── cursorMove (optional post-MVP stub) ──
  socket.on("cursorMove", (data) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    socket.to(room.roomId).emit("cursorMove", data);
  });

  // ── Disconnect ──
  socket.on("disconnect", (reason) => {
    console.log(`[disconnect] ${socket.id}: ${reason}`);
    handleLeave(socket);
  });
});

function handleLeave(socket) {
  const room = getRoomForSocket(socket.id);
  if (!room) return;
  const user = room.users.find((u) => u.id === socket.id);
  room.users = room.users.filter((u) => u.id !== socket.id);
  socket.leave(room.roomId);

  if (room.users.length === 0) {
    rooms.delete(room.roomId);
    console.log(`[cleanup] room ${room.roomId} deleted (empty)`);
  } else {
    // Reassign host if the host left
    if (user && user.userId === room.hostId) {
      room.hostId = room.users[0].userId;
      console.log(`[host] new host in ${room.roomId}: ${room.users[0].name}`);
    }
    socket.to(room.roomId).emit("userLeft", { userId: user?.userId });
    broadcastRoomState(room.roomId);
  }
}

// ─── Health check ─────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", rooms: rooms.size });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎨 DoodleSync server running on http://localhost:${PORT}`);
});
