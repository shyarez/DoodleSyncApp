import { useState, useRef, useEffect, useCallback } from "react";
import { SESSIONS, STICKY_CYCLE } from "./data/constants.js";

// Layout
import { Navbar }     from "./components/layout/Navbar.jsx";
import { HamDrawer }  from "./components/layout/HamDrawer.jsx";

// Toolbar
import { Toolbar }    from "./components/toolbar/Toolbar.jsx";

// Canvas
import { CanvasArea }  from "./components/canvas/CanvasArea.jsx";
import { ZoomControls } from "./components/canvas/ZoomControls.jsx";

// Extras
import { Fonts }        from "./components/extras/Fonts.jsx";
import { ArtDecor }     from "./components/extras/ArtDecor.jsx";
import { IntroScreen }  from "./components/extras/IntroScreen.jsx";
import { ExportModal }  from "./components/extras/ExportModal.jsx";
import { ClearConfirm } from "./components/extras/ClearConfirm.jsx";

let stickyIdCounter = 0;

export default function DoodleSync() {
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
    const cl = e.touches ? e.touches[0] : e;
    panStart.current = { mx:cl.clientX, my:cl.clientY, px:pan.x, py:pan.y };
  }, [pan]);
  const onPanMove = useCallback(e => {
    if (!panStart.current) return;
    const cl = e.touches ? e.touches[0] : e;
    setPan({ x:panStart.current.px+(cl.clientX-panStart.current.mx), y:panStart.current.py+(cl.clientY-panStart.current.my) });
  }, []);
  const onPanEnd = useCallback(() => { panStart.current = null; }, []);

  // Wheel zoom
  useEffect(() => {
    const h = e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => Math.min(4, Math.max(0.25, +(z - e.deltaY*0.001).toFixed(2))));
    };
    window.addEventListener("wheel", h, { passive:false });
    return () => window.removeEventListener("wheel", h);
  }, []);

  // Stickies
  const [stickies, setStickies] = useState([]);
  const addSticky = useCallback(({x,y}) => {
    const id = ++stickyIdCounter;
    setStickies(s=>[...s,{id,x:x-84,y:y-50,w:180,h:140,text:"",color:STICKY_CYCLE[id%STICKY_CYCLE.length],fresh:true}]);
  },[]);
  const moveSticky        = useCallback((id,pos)  => setStickies(s=>s.map(n=>n.id===id?{...n,...pos}:n)),[]);
  const resizeSticky      = useCallback((id,dims) => setStickies(s=>s.map(n=>n.id===id?{...n,...dims}:n)),[]);
  const changeColorSticky = useCallback((id,c)    => setStickies(s=>s.map(n=>n.id===id?{...n,color:c}:n)),[]);
  const deleteSticky      = useCallback((id)      => setStickies(s=>s.filter(n=>n.id!==id)),[]);
  const textChangeSticky  = useCallback((id,text) => setStickies(s=>s.map(n=>n.id===id?{...n,text,fresh:false}:n)),[]);

  // Session / modals
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [currentSession, setCurrentSession] = useState("s1");
  const [showClear, setShowClear]     = useState(false);
  const [showExport, setShowExport]   = useState(false);

  // Canvas ref + history
  const canvasRef    = useRef(null);
  const historyRef   = useRef([]);
  const historyIdx   = useRef(-1);

  const saveSnapshot = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const snap = c.toDataURL();
    historyRef.current = historyRef.current.slice(0, historyIdx.current+1);
    historyRef.current.push(snap);
    if (historyRef.current.length > 60) historyRef.current.shift();
    historyIdx.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    const c = canvasRef.current; if (!c || historyIdx.current <= 0) return;
    historyIdx.current--;
    const img = new Image(); img.src = historyRef.current[historyIdx.current];
    img.onload = () => { const ctx=c.getContext("2d"); ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(img,0,0); };
  }, []);

  const redo = useCallback(() => {
    const c = canvasRef.current; if (!c || historyIdx.current >= historyRef.current.length-1) return;
    historyIdx.current++;
    const img = new Image(); img.src = historyRef.current[historyIdx.current];
    img.onload = () => { const ctx=c.getContext("2d"); ctx.clearRect(0,0,c.width,c.height); ctx.drawImage(img,0,0); };
  }, []);

  // Save snapshot on mouseup/touchend for undo
  useEffect(() => {
    const h = () => setTimeout(saveSnapshot, 50);
    window.addEventListener("mouseup", h);
    window.addEventListener("touchend", h);
    return () => { window.removeEventListener("mouseup",h); window.removeEventListener("touchend",h); };
  }, [saveSnapshot]);

  // Keyboard shortcuts
  useEffect(() => {
    const toolMap  = { h:"hand", p:"pen", k:"pencil", s:"shape", n:"sticky", e:"eraser",
                       r:"shape",  o:"shape", l:"shape", a:"shape" };
    const shapeMap = { r:"rect", o:"ellipse", l:"line", a:"arrow" };
    const handler = e => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.contentEditable==="true") return;
      if ((e.ctrlKey||e.metaKey) && e.key==="z") { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey||e.metaKey) && (e.key==="y"||e.key==="Y")) { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey||e.metaKey) && e.key==="e") { e.preventDefault(); setShowExport(true); return; }
      if (toolMap[e.key]) {
        setActiveTool(toolMap[e.key]);
        if (shapeMap[e.key]) setActiveShape(shapeMap[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Clear canvas
  const handleClear = useCallback(() => {
    const c = canvasRef.current;
    if (c) { c.getContext("2d").clearRect(0,0,c.width,c.height); saveSnapshot(); }
    setStickies([]); setShowClear(false);
  }, [saveSnapshot]);

  // Sync canvas bg with dark mode
  useEffect(() => {
    setCanvasBg(dark ? "#111111" : "#ffffff");
  }, [dark]);

  return (
    <div style={{ width:"100vw", height:"100vh", background:"var(--bg)", overflow:"hidden", position:"relative" }}>
      <Fonts/>
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)}/>}
      <ArtDecor dark={dark}/>
      <Navbar
        currentSession={currentSession} sessions={SESSIONS}
        onHamburger={() => setDrawerOpen(true)}
        onExportOpen={() => setShowExport(true)}
        onClearRequest={() => setShowClear(true)}
        dark={dark} setDark={setDark}
      />
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
      <CanvasArea
        activeTool={activeTool} color={color} strokeWidth={strokeWidth} opacity={opacity}
        lineCap={lineCap} eraserMode={eraserMode} eraserSize={eraserSize}
        canvasRef={canvasRef} stickies={stickies}
        onAddSticky={addSticky} onMoveSticky={moveSticky} onResizeSticky={resizeSticky}
        onChangeColorSticky={changeColorSticky} onDeleteSticky={deleteSticky} onTextChangeSticky={textChangeSticky}
        zoom={zoom} pan={pan} onPanStart={onPanStart} onPanMove={onPanMove} onPanEnd={onPanEnd}
        activeShape={activeShape} fillColor={fillColor} fillEnabled={fillEnabled}
        fillOpacity={fillOpacity} arrowStyle={arrowStyle} canvasBg={canvasBg}
      />
      <ZoomControls zoom={zoom} setZoom={setZoom} onUndo={undo} onRedo={redo}/>
      <HamDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        sessions={SESSIONS} currentSession={currentSession}
        setCurrentSession={id => { setCurrentSession(id); setDrawerOpen(false); }}
        onExport={() => setShowExport(true)} onClear={() => setShowClear(true)}
        dark={dark} setDark={setDark}
      />
      {showClear  && <ClearConfirm onConfirm={handleClear} onCancel={() => setShowClear(false)}/>}
      {showExport && <ExportModal canvasRef={canvasRef} onClose={() => setShowExport(false)}/>}
    </div>
  );
}
