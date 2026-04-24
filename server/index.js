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
      stickies: {}
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

    // Initialize stroke tracking
    room.currentStrokes[data.strokeId] = {
      ...data,
      userId,
      segments: []
    };

    socket.to(room.roomId).emit("stroke:start", { ...data, userId });
    console.log(`[stroke:start] ${data.strokeId} by ${userId}`);
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

    const stroke = room.currentStrokes[data.strokeId];
    if (stroke) {
      room.strokes.push(stroke);
      delete room.currentStrokes[data.strokeId];
      // Broadcast the FULL stroke object so followers can store it
      socket.to(room.roomId).emit("stroke:end", { ...data, fullStroke: stroke });
    } else {
      socket.to(room.roomId).emit("stroke:end", data);
    }
    console.log(`[stroke:end] ${data.strokeId}`);
  });

  socket.on("requestCanvasState", () => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;
    socket.emit("init-canvas", { 
      strokes: room.strokes, 
      stickies: Object.values(room.stickies || {}) 
    });
  });

  // ── Shared Actions ──
  socket.on("undo", () => {
    const room = getRoomForSocket(socket.id);
    if (room) {
      room.strokes.pop(); // Remove the last authoritative stroke globally
      // Force all clients to redraw the new correct state
      io.to(room.roomId).emit("init-canvas", {
        strokes: room.strokes,
        stickies: Object.values(room.stickies || {})
      });
    }
  });

  socket.on("clearCanvas", ({ userId }) => {
    const room = getRoomForSocket(socket.id);
    if (!room) return;

    // Remove ONLY this user's strokes
    room.strokes = room.strokes.filter(s => s.userId !== userId);

    // Remove in-progress strokes
    Object.keys(room.currentStrokes).forEach(key => {
      if (room.currentStrokes[key].userId === userId) {
        delete room.currentStrokes[key];
      }
    });

    // Broadcast full updated state to ALL clients
    io.to(room.roomId).emit("init-canvas", {
      strokes: room.strokes,
      stickies: Object.values(room.stickies || {})
    });

    console.log(`[clearCanvas] ${userId} cleared their strokes`);
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
