import { useState, useRef, useEffect, useCallback } from "react";
import { ARROW_STYLES, STICKY_CYCLE } from "./data/constants.js";

// Layout
import { Navbar }     from "./components/layout/Navbar.jsx";
import { HamDrawer }  from "./components/layout/HamDrawer.jsx";

// Toolbar
import { Toolbar }    from "./components/toolbar/Toolbar.jsx";

// Canvas
import { CanvasArea }  from "./components/canvas/CanvasArea.jsx";
import { SplitCanvas } from "./components/canvas/SplitCanvas.jsx";
import { ZoomControls } from "./components/canvas/ZoomControls.jsx";

// Extras
import { Fonts }        from "./components/extras/Fonts.jsx";
import { ArtDecor }     from "./components/extras/ArtDecor.jsx";
import { IntroScreen }  from "./components/extras/IntroScreen.jsx";
import { ExportModal }  from "./components/extras/ExportModal.jsx";
import { ClearConfirm } from "./components/extras/ClearConfirm.jsx";

// Sockets & Utils
import { useSocket } from "./hooks/useSocket.js";
import { uid } from "./utils/uid.js";

export default function DoodleSync() {
  // Sockets
  const socket = useSocket();

  // Intro
  const [showIntro, setShowIntro] = useState(true);

  // Theme
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("ds-dark") === "1"; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
    try { localStorage.setItem("ds-dark", dark ? "1" : "0"); } catch {}
  }, [dark]);

  // Tool state
  const [activeTool, setActiveTool] = useState("pen");
  const [color, setColor] = useState("#1e1b4b");
  const [paletteMode, setPaletteMode] = useState("vivid");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [opacity, setOpacity] = useState(100);
  const [lineCap, setLineCap] = useState("round");
  const [eraserMode, setEraserMode] = useState("freehand");
  const [eraserSize, setEraserSize] = useState(20);

  // Shape-specific state
  const [activeShape, setActiveShape] = useState("rect");
  const [fillColor, setFillColor] = useState("#a78bfa");
  const [fillEnabled, setFillEnabled] = useState(false);
  const [fillOpacity, setFillOpacity] = useState(40);
  const [arrowStyle, setArrowStyle] = useState("solid");

  // Canvas background
  const [canvasBg, setCanvasBg] = useState("#ffffff");

  // Zoom + pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x:0, y:0 });
  const panStart = useRef(null);

  const onPanStart = useCallback(e => {
    if (socket.mode === "split" && socket.connected) return;
    const cl = e.touches ? e.touches[0] : e;
    panStart.current = { mx:cl.clientX, my:cl.clientY, px:pan.x, py:pan.y };
  }, [pan, socket.mode, socket.connected]);
  const onPanMove = useCallback(e => {
    if (!panStart.current || (socket.mode === "split" && socket.connected)) return;
    const cl = e.touches ? e.touches[0] : e;
    const nx = panStart.current.px+(cl.clientX-panStart.current.mx);
    const ny = panStart.current.py+(cl.clientY-panStart.current.my);
    setPan({ x: nx, y: ny });
    socket.emitPanMove?.(nx, ny);
  }, [socket, socket.mode, socket.connected]);
  const onPanEnd = useCallback(() => { panStart.current = null; }, []);

  // Wheel zoom
  useEffect(() => {
    const h = e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      if (socket.mode === "split" && socket.connected) return;
      setZoom(z => Math.min(4, Math.max(0.25, +(z - e.deltaY*0.001).toFixed(2))));
    };
    window.addEventListener("wheel", h, { passive:false });
    return () => window.removeEventListener("wheel", h);
  }, [socket.mode, socket.connected]);

  // Multi-user zoom lock
  useEffect(() => {
    if (socket.users.length > 1 && socket.connected) {
      setZoom(1);
      setPan({ x:0, y:0 });
    }
  }, [socket.users.length, socket.connected]);

  // Stickies
  const [stickies, setStickies] = useState([]);


  const addSticky = useCallback(({x,y}) => {
    const id = uid();
    const newS = {
      id, x: x - 84, y: y - 50, w: 180, h: 140, text: "",
      color: STICKY_CYCLE[Math.floor(Math.random() * STICKY_CYCLE.length)],
      fresh: true,
      creatorId: socket.user.userId
    };
    setStickies(s=>[...s,newS]);
    socket.emitStickyAdd(newS);
  }, [socket]);
  const moveSticky = useCallback((id,pos) => {
    setStickies(s=>s.map(n=>n.id===id?{...n,...pos}:n));
    socket.emitStickyMove(id, pos);
  }, [socket]);
  const resizeSticky = useCallback((id,dims) => {
    setStickies(s=>s.map(n=>n.id===id?{...n,...dims}:n));
    socket.emitStickyMove(id, dims); // move handles dims as well
  }, [socket]);
  const changeColorSticky = useCallback((id,c) => {
    setStickies(s=>s.map(n=>n.id===id?{...n,color:c}:n));
    socket.emitStickyColor(id, c);
  }, [socket]);
  const deleteSticky = useCallback((id) => {
    setStickies(s=>s.filter(n=>n.id!==id));
    socket.emitStickyDelete(id);
  }, [socket]);
  const textChangeSticky = useCallback((id,text) => {
    socket.emitStickyText(id, text);
    setStickies(s=>s.map(n=>n.id===id?{...n,text,fresh:false}:n));
  }, [socket]);

  // Canvas ref + history
  const canvasRef    = useRef(null);
  const allStrokes   = useRef([]);

  const handleUndo = useCallback(() => { socket.emitUndo(); }, [socket]);
  const handleRedo = useCallback(() => { socket.emitRedo(); }, [socket]);

  // Session / modals
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [showClear, setShowClear]     = useState(false);
  const [showExport, setShowExport]   = useState(false);

  // Keyboard shortcuts (Global Undo/Redo + Tools)
  useEffect(() => {
    const toolMap  = { h:"hand", p:"pen", k:"pencil", s:"shape", n:"sticky", e:"eraser",
                       r:"shape",  o:"shape", l:"shape", a:"shape" };
    const shapeMap = { r:"rect", o:"ellipse", l:"line", a:"arrow" };
    const handleKeyDown = (e) => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.contentEditable==="true") return;

      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey||e.metaKey) && e.key==="e") {
        e.preventDefault();
        setShowExport(true);
      } else if (toolMap[e.key]) {
        setActiveTool(toolMap[e.key]);
        if (shapeMap[e.key]) setActiveShape(shapeMap[e.key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Fast-forward canvas rendering
  const replayHistory = useCallback((canvas, strokes) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create a temporary canvas for per-user rendering to support selective erasing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tctx = tempCanvas.getContext("2d", { willReadFrequently: true });

    // Group strokes by userId to process them in "layers"
    const userIds = [];
    const strokesByUser = {};
    strokes.forEach(s => {
      const uid = s.userId || "anonymous";
      if (!strokesByUser[uid]) {
        strokesByUser[uid] = [];
        userIds.push(uid); // Preserves order of user appearance
      }
      strokesByUser[uid].push(s);
    });

    userIds.forEach(uid => {
      tctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      const userStrokes = strokesByUser[uid];

      userStrokes.forEach(stroke => {
        tctx.save();
        const tool = stroke.tool;
        const conf = stroke;

        // Eraser strokes are never stored in room.strokes (removed by server on erase events)
        if (tool === "eraser") {
          tctx.restore();
          return;
        }
        else if (tool === "pen" || tool === "pencil") {
          // Aggregate all points from the start and all subsequent segments
          const pts = [];
          if (conf.x !== undefined) pts.push({ x: conf.x, y: conf.y });
          (conf.segments || []).forEach(seg => {
            if (seg.points) pts.push(...seg.points);
            else if (seg.x !== undefined) pts.push({ x: seg.x, y: seg.y });
          });

          if (pts.length < 2) { tctx.restore(); return; }

          tctx.strokeStyle = conf.color;
          tctx.lineWidth = conf.strokeWidth;
          tctx.lineCap = "round";
          tctx.lineJoin = "round";
          tctx.globalAlpha = conf.opacity / 100;

          if (tool === "pencil") {
            // Pencil sketch effect: two passes
            tctx.globalAlpha = (conf.opacity / 100) * 0.7;
            tctx.lineWidth = conf.strokeWidth * 0.7;
            tctx.beginPath();
            tctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) tctx.lineTo(pts[i].x, pts[i].y);
            tctx.stroke();

            tctx.globalAlpha = (conf.opacity / 100) * 0.3;
            tctx.lineWidth = conf.strokeWidth * 0.4;
            tctx.beginPath();
            tctx.moveTo(pts[0].x + 0.8, pts[0].y - 0.5);
            for (let i = 1; i < pts.length; i++) {
              tctx.lineTo(pts[i].x + (Math.random() - 0.5), pts[i].y + (Math.random() - 0.5));
            }
            tctx.stroke();
          } else {
            // Pen: solid line
            tctx.beginPath();
            tctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) tctx.lineTo(pts[i].x, pts[i].y);
            tctx.stroke();
          }
        }
        else if (conf.isShape) {
          tctx.globalCompositeOperation = "source-over";
          tctx.lineWidth = conf.strokeWidth;
          tctx.strokeStyle = conf.color;
          tctx.lineCap = conf.lineCap || "round";
          tctx.lineJoin = "round";
          tctx.globalAlpha = conf.opacity / 100;
          
          const sx = conf.startX, sy = conf.startY, ex = conf.endX, ey = conf.endY;
          tctx.beginPath();
          if (tool === "rect") {
            tctx.strokeRect(sx, sy, ex - sx, ey - sy);
            if (conf.fillEnabled) {
              tctx.globalAlpha = conf.fillOpacity / 100;
              tctx.fillStyle = conf.fillColor;
              tctx.fillRect(sx, sy, ex - sx, ey - sy);
            }
          } else if (tool === "ellipse") {
            const rx = Math.abs(ex - sx) / 2, ry = Math.abs(ey - sy) / 2;
            const cx2 = sx + (ex - sx) / 2, cy2 = sy + (ey - sy) / 2;
            tctx.ellipse(cx2, cy2, rx, ry, 0, 0, 2 * Math.PI); tctx.stroke();
            if (conf.fillEnabled) {
              tctx.globalAlpha = conf.fillOpacity / 100;
              tctx.fillStyle = conf.fillColor;
              tctx.beginPath(); tctx.ellipse(cx2, cy2, rx, ry, 0, 0, 2 * Math.PI); tctx.fill();
            }
          } else if (tool === "line") {
            tctx.moveTo(sx, sy); tctx.lineTo(ex, ey); tctx.stroke();
          } else if (tool === "arrow") {
            const style = ARROW_STYLES.find(s => s.id === conf.arrowStyle) || ARROW_STYLES[0];
            tctx.setLineDash(style.dash.length ? style.dash : []);
            
            if (conf.arrowStyle === "curved") {
              const mx = (sx+ex)/2, my = (sy+ey)/2;
              const dx = ex-sx, dy = ey-sy;
              const len = Math.sqrt(dx*dx+dy*dy) || 1;
              const cpx = mx - dy/len * len*0.25, cpy = my + dx/len * len*0.25;
              tctx.beginPath(); tctx.moveTo(sx, sy); tctx.quadraticCurveTo(cpx, cpy, ex, ey); tctx.stroke();
              const t = 0.98;
              const tx = 2*(1-t)*(cpx-sx)+2*t*(ex-cpx);
              const ty = 2*(1-t)*(cpy-sy)+2*t*(ey-cpy);
              const angle = Math.atan2(ty, tx), hw = 13;
              tctx.setLineDash([]);
              tctx.beginPath();
              tctx.moveTo(ex-hw*Math.cos(angle-Math.PI/7), ey-hw*Math.sin(angle-Math.PI/7));
              tctx.lineTo(ex, ey);
              tctx.lineTo(ex-hw*Math.cos(angle+Math.PI/7), ey-hw*Math.sin(angle+Math.PI/7));
              tctx.stroke();
            } else {
              // Straight arrow (solid, dashed, or dotted)
              tctx.beginPath();
              tctx.moveTo(sx, sy); tctx.lineTo(ex, ey); tctx.stroke();
              const a = Math.atan2(ey - sy, ex - sx), hw = 13;
              tctx.setLineDash([]);
              tctx.beginPath();
              tctx.moveTo(ex - hw*Math.cos(a - Math.PI/7), ey - hw*Math.sin(a - Math.PI/7));
              tctx.lineTo(ex, ey);
              tctx.lineTo(ex - hw*Math.cos(a + Math.PI/7), ey - hw*Math.sin(a + Math.PI/7));
              tctx.stroke();
            }
          }
        }
        tctx.restore();
      });

      // Composite the user's layer onto the main canvas
      ctx.drawImage(tempCanvas, 0, 0);
    });
  }, []);

  const handleClearReq = useCallback(() => {
    socket.emitClear();
    setShowClear(false);
  }, [socket]);

  // ─── Socket Event Listeners (Stable) ───
  useEffect(() => {
    // 1. Sticky Notes
    socket.onRemoteSticky({
      onAdd: (data) => setStickies(s => [...s, data]),
      onMove: (data) => setStickies(s => s.map(n => n.id === data.id ? { ...n, ...data } : n)),
      onDelete: (data) => setStickies(s => s.filter(n => n.id !== data.id)),
      onText: (data) => {
        setStickies(prev => {
        const updated = prev.map(n =>
          n.id === data.id
            ? { ...n, text: data.text, fresh: false }
            : n
        );
    return [...updated]; // 🔥 force re-render
  });
},
      onColor: (data) => setStickies(s => s.map(n => n.id === data.id ? { ...n, color: data.color } : n)),
    });

    // 2. Room State Sync
    socket.onRemoteStateSync((data) => {
      const c = canvasRef.current;
      if (c && data.strokes) {
        allStrokes.current = data.strokes;
        replayHistory(c, data.strokes);
      }
      if (data.stickies) {
        setStickies(data.stickies);
      }
    });

    // 3. Pan Sync
    socket.onRemotePanMove?.((data) => {
      setPan({ x: data.x, y: data.y });
    });

    // 3. User Actions (Undo/Clear)
    socket.onRemoteAction({
      // Clear is now handled by onRemoteStateSync (init-canvas)
    });

    // 4. Stroke Lifecycle (Incremental) - Now handled primarily by init-canvas for final states

  }, [socket, replayHistory]);

  // Sync canvas bg with dark mode



  // Sync canvas bg with dark mode
  useEffect(() => {
    setCanvasBg(dark ? "#111111" : "#ffffff");
  }, [dark]);

  return (
    <div style={{ width:"100vw", height:"100vh", background:"var(--bg)", overflow:"hidden", position:"relative", display: "flex", flexDirection: "column" }}>
      <Fonts/>
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)}/>}
      {!socket.connected && <ArtDecor dark={dark} />}
      <Navbar
        socket={socket}
        onHamburger={() => setDrawerOpen(true)}
        onExportOpen={() => setShowExport(true)}
        onClearRequest={() => setShowClear(true)}
        onForceSync={() => socket.forceSync()}
        dark={dark} setDark={setDark}
      />
      
      <div style={{ flex: 1, display: "flex", width: "100%", overflow: "hidden", position: "relative" }}>
        
        {/* The permanent drawing container (Never moves, never dies) */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", zIndex: 5 }}>
          <CanvasArea
            activeTool={activeTool} color={color} strokeWidth={strokeWidth} opacity={opacity}
            lineCap={lineCap} eraserMode={eraserMode} eraserSize={eraserSize}
            canvasRef={canvasRef} stickies={stickies}
            onAddSticky={addSticky} onMoveSticky={moveSticky} onResizeSticky={resizeSticky}
            onChangeColorSticky={changeColorSticky} onDeleteSticky={deleteSticky} onTextChangeSticky={textChangeSticky}
            zoom={zoom} pan={pan} onPanStart={onPanStart} onPanMove={onPanMove} onPanEnd={onPanEnd}
            activeShape={activeShape} fillColor={fillColor} fillEnabled={fillEnabled}
            fillOpacity={fillOpacity} arrowStyle={arrowStyle} canvasBg={canvasBg}
            emitStrokeStart={socket.emitStrokeStart}
            emitStrokeUpdate={socket.emitStrokeUpdate}
            emitStrokeEnd={socket.emitStrokeEnd}
            emitErase={socket.emitErase}
            emitEraseSegment={socket.emitEraseSegment}
            emitPanMove={socket.emitPanMove}
            onRemoteStrokeStart={socket.onRemoteStrokeStart}
            onRemoteStrokeUpdate={socket.onRemoteStrokeUpdate}
            onRemoteStrokeEnd={socket.onRemoteStrokeEnd}
            user={socket.user}
          />
        </div>

        {/* The Mirrored split pane */}
        {socket.connected && socket.mode === "split" && socket.users.length > 1 && (
          <div style={{ flex: 1, borderLeft: "2px solid var(--border)", position: "relative", zIndex: 10 }}>
            <SplitCanvas canvasRef={canvasRef} stickies={stickies} canvasBg={canvasBg} />
          </div>
        )}

      </div>

      <Toolbar
        activeTool={activeTool} setActiveTool={setActiveTool}
        color={color} setColor={setColor} paletteMode={paletteMode} setPaletteMode={setPaletteMode}
        strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
        opacity={opacity} setOpacity={setOpacity}
        lineCap={lineCap} setLineCap={setLineCap}
        eraserMode={eraserMode} setEraserMode={setEraserMode}
        eraserSize={eraserSize} setEraserSize={setEraserSize}
        activeShape={activeShape} setActiveShape={setActiveShape}
        fillColor={fillColor} setFillColor={setFillColor}
        fillEnabled={fillEnabled} setFillEnabled={setFillEnabled}
        fillOpacity={fillOpacity} setFillOpacity={setFillOpacity}
        arrowStyle={arrowStyle} setArrowStyle={setArrowStyle}
        canvasBg={canvasBg} setCanvasBg={setCanvasBg}
        dark={dark}
      />

      <ZoomControls zoom={zoom} setZoom={setZoom} onUndo={handleUndo} onRedo={handleRedo} hidden={socket.users.length > 1 && socket.connected} />
      <HamDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        socket={socket}
        onExport={() => setShowExport(true)} onClear={() => setShowClear(true)}
        dark={dark} setDark={setDark}
      />
      {showClear  && <ClearConfirm onConfirm={handleClearReq} onCancel={() => setShowClear(false)}/>}
      {showExport && <ExportModal canvasRef={canvasRef} onClose={() => setShowExport(false)}/>}
    </div>
  );
}
