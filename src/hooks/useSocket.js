import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { uid } from "../utils/uid.js";

// Persistent user identity across sessions
function getOrCreateUser() {
  try {
    const stored = sessionStorage.getItem("ds-user");
    if (stored) return JSON.parse(stored);
  } catch {}
  const colors = ["#e879a0", "#a78bfa", "#38bdf8", "#f97316", "#10b981"];
  const user = {
    userId: uid(),
    name: "User-" + Math.random().toString(36).slice(2, 6),
    color: colors[Math.floor(Math.random() * colors.length)],
  };
  try { sessionStorage.setItem("ds-user", JSON.stringify(user)); } catch {}
  return user;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [mode, setMode] = useState("shared");
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const userRef = useRef(getOrCreateUser());
  const strokeStartCallbackRef = useRef(null);
  const strokeUpdateCallbackRef = useRef(null);
  const strokeEndCallbackRef = useRef(null);
  const stickyCallbacksRef = useRef({});
  const undoCallbackRef = useRef(null);
  const redoCallbackRef = useRef(null);
  const clearCallbackRef = useRef(null);
  const initCanvasCallbackRef = useRef(null);
  const panMoveCallbackRef = useRef(null);

  // Throttle ref for draw events
  const lastEmitTime = useRef(0);

  useEffect(() => {
    const socket = io("http://localhost:3001",{
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ CONNECTED TO BACKEND:", socket.id); 
      // Auto-rejoin if we had a room
      try {
        const storedRoom = sessionStorage.getItem("ds-room");
        if (storedRoom) {
          const user = userRef.current;
          socket.emit("rejoinRoom", {
            roomId: storedRoom,
            userId: user.userId,
            name: user.name,
            color: user.color,
          });
        }
      } catch {}
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("roomCreated", ({ roomId }) => {
      setRoomId(roomId);
      try { sessionStorage.setItem("ds-room", roomId); } catch {}
    });

    socket.on("joinedRoom", ({ roomId }) => {
      setRoomId(roomId);
      try { sessionStorage.setItem("ds-room", roomId); } catch {}
    });

    socket.on("roomState", ({ users: u, hostId, mode: m }) => {
      setUsers(u);
      setIsHost(hostId === userRef.current.userId);
      setMode(m);
    });

    socket.on("modeChanged", ({ mode: m }) => setMode(m));

    socket.on("userJoined", () => {}); // roomState handles UI update
    socket.on("userLeft", () => {});   // roomState handles UI update

    socket.on("error", ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    });

    // ─── Stroke Lifecycle (Incremental) ───
    socket.on("stroke:start", (data) => {
      if (strokeStartCallbackRef.current) strokeStartCallbackRef.current(data);
    });

    socket.on("stroke:update", (data) => {
      if (strokeUpdateCallbackRef.current) strokeUpdateCallbackRef.current(data);
    });

    socket.on("stroke:end", (data) => {
      if (strokeEndCallbackRef.current) strokeEndCallbackRef.current(data);
    });

    socket.on("undo", () => undoCallbackRef.current && undoCallbackRef.current());
    socket.on("redo", () => redoCallbackRef.current && redoCallbackRef.current());
    socket.on("clear-canvas", () => clearCallbackRef.current && clearCallbackRef.current());
    
    socket.on("init-canvas", (data) => {
      if (initCanvasCallbackRef.current) initCanvasCallbackRef.current(data);
    });

    socket.on("panMove", (data) => {
      if (panMoveCallbackRef.current) panMoveCallbackRef.current(data);
    });

    // Sticky events
    socket.on("stickyAdd", (data) => stickyCallbacksRef.current.onAdd?.(data));
    socket.on("stickyMove", (data) => stickyCallbacksRef.current.onMove?.(data));
    socket.on("stickyDelete", (data) => stickyCallbacksRef.current.onDelete?.(data));
    socket.on("stickyText", (data) => stickyCallbacksRef.current.onText?.(data));
    socket.on("stickyColor", (data) => stickyCallbacksRef.current.onColor?.(data));

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    const u = userRef.current;
    s.emit("createRoom", { userId: u.userId, name: u.name, color: u.color });
  }, []);

  const joinRoom = useCallback((roomId) => {
    const s = socketRef.current;
    if (!s) return;
    const u = userRef.current;
    s.emit("joinRoom", { roomId: roomId.trim().toLowerCase(), userId: u.userId, name: u.name, color: u.color });
  }, []);

  const leaveRoom = useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("leaveRoom");
    setRoomId(null);
    setUsers([]);
    setIsHost(false);
    setMode("shared");
    try { sessionStorage.removeItem("ds-room"); } catch {}
  }, []);

  const emitStrokeStart = useCallback((data) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stroke:start", { ...data, userId: userRef.current.userId });
  }, [roomId]);

  const emitStrokeUpdate = useCallback((data) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stroke:update", data);
  }, [roomId]);

  const emitStrokeEnd = useCallback((data) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stroke:end", data);
  }, [roomId]);

  const emitUndo = useCallback(() => socketRef.current?.emit("undo"), []);
  const emitRedo = useCallback(() => socketRef.current?.emit("redo"), []);
  const emitClear = useCallback(() => {
    socketRef.current?.emit("clearCanvas", {
      userId: userRef.current.userId
    });
  }, []);

  // emitErase: send full erase geometry (freehand path, lasso polygon, or rect)
  const emitErase = useCallback((payload) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("erase", { ...payload, userId: userRef.current.userId });
  }, [roomId]);

  const emitEraseSegment = useCallback((x, y, radius) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("eraseSegment", { x, y, radius, userId: userRef.current.userId });
  }, [roomId]);

  const emitPanMove = useCallback((x, y) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("panMove", { x, y });
  }, [roomId]);

  const changeMode = useCallback((newMode) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("changeMode", { mode: newMode });
  }, [roomId]);

  const forceSync = useCallback(() => {
    socketRef.current?.emit("requestCanvasState");
  }, []);

  // Sticky note sync helpers
  const emitStickyAdd = useCallback((data) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stickyAdd", data);
  }, [roomId]);

  const emitStickyMove = useCallback((id, pos) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stickyMove", { id, ...pos });
  }, [roomId]);

  const emitStickyDelete = useCallback((id) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stickyDelete", { id });
  }, [roomId]);

  const emitStickyText = useCallback((id, text) => {
  const s = socketRef.current;
  if (!s || !roomId) return;

  s.emit("stickyText", {
    id,
    text,
    userId: userRef.current.userId,
    ts: Date.now()
  });
}, [roomId]);

  const emitStickyColor = useCallback((id, color) => {
    const s = socketRef.current;
    if (!s || !roomId) return;
    s.emit("stickyColor", { id, color });
  }, [roomId]);

  const onRemoteStrokeStart = useCallback((cb) => { strokeStartCallbackRef.current = cb; }, []);
  const onRemoteStrokeUpdate = useCallback((cb) => { strokeUpdateCallbackRef.current = cb; }, []);
  const onRemoteStrokeEnd = useCallback((cb) => { strokeEndCallbackRef.current = cb; }, []);
  const onRemoteSticky = useCallback((cbs) => { stickyCallbacksRef.current = cbs; }, []);
  
  const onRemoteAction = useCallback((cbs) => {
    undoCallbackRef.current = cbs.onUndo;
    redoCallbackRef.current = cbs.onRedo;
    clearCallbackRef.current = cbs.onClear;
  }, []);

  const onRemoteStateSync = useCallback((cb) => {
    initCanvasCallbackRef.current = cb;
  }, []);

  const onRemotePanMove = useCallback((cb) => {
    panMoveCallbackRef.current = cb;
  }, []);

  return useMemo(() => ({
    connected, roomId, users, isHost, mode, error,
    user: userRef.current,
    createRoom, joinRoom, leaveRoom,
    emitStrokeStart, emitStrokeUpdate, emitStrokeEnd, emitErase, emitEraseSegment, emitPanMove, changeMode,
    emitStickyAdd, emitStickyMove, emitStickyDelete, emitStickyText, emitStickyColor,
    emitUndo, emitRedo, emitClear, forceSync,
    onRemoteStrokeStart, onRemoteStrokeUpdate, onRemoteStrokeEnd, onRemoteSticky, onRemoteAction, onRemoteStateSync, onRemotePanMove,
  }), [
    connected, roomId, users, isHost, mode, error,
    createRoom, joinRoom, leaveRoom,
    emitStrokeStart, emitStrokeUpdate, emitStrokeEnd, emitErase, emitEraseSegment, emitPanMove, changeMode,
    emitStickyAdd, emitStickyMove, emitStickyDelete, emitStickyText, emitStickyColor,
    emitUndo, emitRedo, emitClear, forceSync,
    onRemoteStrokeStart, onRemoteStrokeUpdate, onRemoteStrokeEnd, onRemoteSticky, onRemoteAction, onRemoteStateSync, onRemotePanMove
  ]);
}
