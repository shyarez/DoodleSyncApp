import { useState, useRef, useEffect, useCallback } from "react";
import { ARROW_STYLES } from "../../data/constants.js";
import { uid } from "../../utils/uid.js";
import { StickyNote } from "./StickyNote.jsx";
import { EmptyState } from "./EmptyState.jsx";

export const CanvasArea = ({ activeTool, color, strokeWidth, opacity, lineCap, eraserMode, eraserSize,
    canvasRef, stickies, onAddSticky, onMoveSticky, onResizeSticky, onChangeColorSticky, onDeleteSticky, onTextChangeSticky,
    zoom, pan, onPanStart, onPanMove, onPanEnd,
    activeShape, fillColor, fillEnabled, fillOpacity, arrowStyle, canvasBg,
    emitStrokeStart, emitStrokeUpdate, emitStrokeEnd, 
    onRemoteStrokeStart, onRemoteStrokeUpdate, onRemoteStrokeEnd, user }) => {
  
  const currentStrokeId = useRef(null);
  const currentSeq = useRef(0);
  const lastEmitTime = useRef(0);
  const lastEmitPoint = useRef({ x: 0, y: 0 });
  
  const remoteStrokes = useRef(new Map()); // Map<strokeId, { lastSeq, lastPoint }>
  
  const prevPt = useRef(null);
  const lastPt = useRef(null); // for shapes
  const drawing = useRef(false);
  const startPt = useRef({ x:0, y:0 });
  const snapshot = useRef(null);
  const lassoPath = useRef([]);
  const rectEnd = useRef({ x:0, y:0 });
  const overlayRef = useRef();
  const pencilPoints = useRef([]);
  const [cursor, setCursor] = useState({ x:0, y:0, vis:false });

  const drawTool = activeTool === "shape" ? activeShape : activeTool;

  const toCanvas = useCallback((e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const cl = e.touches ? e.touches[0] : e;
    return { x:(cl.clientX - r.left) / zoom, y:(cl.clientY - r.top) / zoom };
  }, [zoom]);

  const getCursor = () => {
    if (activeTool==="select") return "default";
    if (activeTool==="hand")   return "grab";
    if (activeTool==="sticky") return "copy";
    if (activeTool==="eraser") return "none";
    return "crosshair";
  };

  const applyArrowDash = (ctx) => {
    const style = ARROW_STYLES.find(s => s.id === arrowStyle) || ARROW_STYLES[0];
    ctx.setLineDash(style.dash.length ? style.dash.map(v => v / zoom) : []);
  };

  const drawArrow = (ctx, sx, sy, ex, ey, curved = false) => {
    ctx.beginPath();
    if (curved) {
      const mx = (sx+ex)/2, my = (sy+ey)/2;
      const dx = ex-sx, dy = ey-sy;
      const len = Math.sqrt(dx*dx+dy*dy) || 1;
      const cpx = mx - dy/len * len*0.25;
      const cpy = my + dx/len * len*0.25;
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.stroke();
      const t = 0.98;
      const tx = 2*(1-t)*(cpx-sx) + 2*t*(ex-cpx);
      const ty = 2*(1-t)*(cpy-sy) + 2*t*(ey-cpy);
      const angle = Math.atan2(ty, tx);
      const hw = 13;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ex - hw*Math.cos(angle-Math.PI/7), ey - hw*Math.sin(angle-Math.PI/7));
      ctx.lineTo(ex, ey);
      ctx.lineTo(ex - hw*Math.cos(angle+Math.PI/7), ey - hw*Math.sin(angle+Math.PI/7));
      ctx.stroke();
    } else {
      ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      const a = Math.atan2(ey-sy, ex-sx), hw = 13;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ex-hw*Math.cos(a-Math.PI/7), ey-hw*Math.sin(a-Math.PI/7));
      ctx.lineTo(ex, ey);
      ctx.lineTo(ex-hw*Math.cos(a+Math.PI/7), ey-hw*Math.sin(a+Math.PI/7));
      ctx.stroke();
    }
  };

  const drawPencilSketch = (ctx, pts, col, lw, op) => {
    if (pts.length < 2) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = col; ctx.lineWidth = lw * 0.7;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.globalAlpha = (op / 100) * 0.7;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i=1; i<pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.globalAlpha = (op / 100) * 0.3;
    ctx.lineWidth = lw * 0.4;
    ctx.beginPath();
    ctx.moveTo(pts[0].x + 0.8, pts[0].y - 0.5);
    for (let i=1; i<pts.length; i++) {
      const nx = (Math.random()-0.5)*1.4;
      const ny = (Math.random()-0.5)*1.4;
      ctx.lineTo(pts[i].x + nx, pts[i].y + ny);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const startDraw = useCallback(e => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (activeTool==="select") return;
    if (activeTool==="hand")   { onPanStart(e); return; }
    if (activeTool==="sticky") {
      const r = canvas.getBoundingClientRect();
      const cl = e.touches ? e.touches[0] : e;
      onAddSticky({ x:cl.clientX - r.left, y:cl.clientY - r.top }); return;
    }
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const pt = toCanvas(e, canvas);
    
    drawing.current = true; 
    startPt.current = pt;
    const strokeId = uid();
    currentStrokeId.current = strokeId;
    currentSeq.current = 0;
    lastEmitPoint.current = pt;
    lastEmitTime.current = Date.now();
    
    prevPt.current = pt;
    lastPt.current = pt;
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Initial stroke setup - EMIT FOR ALL TOOLS
    emitStrokeStart?.({
      strokeId,
      tool: drawTool,
      color,
      strokeWidth,
      lineCap,
      opacity,
      eraserMode,
      eraserSize,
      x: pt.x,
      y: pt.y,
      // For shapes
      startX: pt.x,
      startY: pt.y,
      fillColor,
      fillEnabled,
      fillOpacity,
      arrowStyle,
      seq: 0
    });

    if (drawTool==="pen") { ctx.beginPath(); ctx.moveTo(pt.x, pt.y); }
    else if (drawTool==="pencil") { pencilPoints.current = [pt]; }
    else if (drawTool==="eraser") {
      if (eraserMode==="freehand") { ctx.beginPath(); ctx.moveTo(pt.x, pt.y); }
      else if (eraserMode==="lasso") lassoPath.current = [pt];
      else if (eraserMode==="rect") { rectEnd.current = pt; }
    }
  }, [activeTool, drawTool, eraserMode, canvasRef, onAddSticky, onPanStart, toCanvas, emitStrokeStart, color, strokeWidth, lineCap, opacity, eraserSize]);

  const drawMove = useCallback(e => {
  const canvas = canvasRef.current; if (!canvas) return;
  if (activeTool === "hand") { onPanMove(e); return; }

  const pt = toCanvas(e, canvas);
  lastPt.current = pt;

  setCursor({
    x: (e.touches ? e.touches[0] : e).clientX,
    y: (e.touches ? e.touches[0] : e).clientY,
    vis: true
  });

  if (!drawing.current) return;

  const ctx = canvas.getContext("2d");

  // ───────── ERASER ─────────
  if (drawTool === "eraser") {

    if (eraserMode === "freehand") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.moveTo(prevPt.current.x, prevPt.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();

      const now = Date.now();
      const dist = Math.hypot(pt.x - lastEmitPoint.current.x, pt.y - lastEmitPoint.current.y);
      
      if (now - lastEmitTime.current > 16 || dist > 2) {
        currentSeq.current++;
        emitStrokeUpdate?.({
          strokeId: currentStrokeId.current,
          seq: currentSeq.current,
          x: pt.x,
          y: pt.y
        });
        lastEmitTime.current = now;
        lastEmitPoint.current = pt;
      }

      prevPt.current = pt;
    }

    else if (eraserMode === "lasso") {
      lassoPath.current.push(pt);
      const ov = overlayRef.current; if (!ov) return;
      const oc = ov.getContext("2d");

      oc.clearRect(0,0,ov.width,ov.height);
      oc.save();
      oc.beginPath();

      const lp = lassoPath.current;
      oc.moveTo(lp[0].x, lp[0].y);

      for (let i=1; i<lp.length; i++) {
        if (i < lp.length - 1) {
          const mx = (lp[i].x + lp[i+1].x) / 2;
          const my = (lp[i].y + lp[i+1].y) / 2;
          oc.quadraticCurveTo(lp[i].x, lp[i].y, mx, my);
        } else {
          oc.lineTo(lp[i].x, lp[i].y);
        }
      }

      oc.closePath();
      oc.fillStyle = "rgba(248,113,113,0.18)";
      oc.fill();

      oc.strokeStyle = "rgba(239,68,68,0.75)";
      oc.lineWidth = 1.5 / zoom;
      oc.setLineDash([5/zoom, 3/zoom]);
      oc.stroke();
      oc.setLineDash([]);

      oc.restore();
    }

    else if (eraserMode === "rect") {
      rectEnd.current = pt;
      const ov = overlayRef.current; if (!ov) return;

      const oc = ov.getContext("2d");
      const s = startPt.current;

      oc.clearRect(0,0,ov.width,ov.height);
      oc.strokeStyle = "rgba(139,92,246,0.7)";
      oc.lineWidth = 1.5 / zoom;
      oc.setLineDash([5/zoom,4/zoom]);

      oc.beginPath();
      oc.strokeRect(s.x, s.y, pt.x - s.x, pt.y - s.y);
      oc.setLineDash([]);
    }

    return;
  }

  // ───────── NORMAL DRAW ─────────
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = lineCap;
  ctx.lineJoin = "round";
  ctx.globalAlpha = opacity / 100;

  const sx = startPt.current.x;
  const sy = startPt.current.y;

  if (drawTool === "pen") {
    ctx.beginPath();
    ctx.moveTo(prevPt.current.x, prevPt.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    const now = Date.now();
    const dist = Math.hypot(pt.x - lastEmitPoint.current.x, pt.y - lastEmitPoint.current.y);
    
    if (now - lastEmitTime.current > 16 || dist > 2) {
      currentSeq.current++;
      emitStrokeUpdate?.({
        strokeId: currentStrokeId.current,
        seq: currentSeq.current,
        x: pt.x,
        y: pt.y
      });
      lastEmitTime.current = now;
      lastEmitPoint.current = pt;
    }

    prevPt.current = pt;
  }

  else if (drawTool === "pencil") {
    pencilPoints.current.push(pt);
    ctx.putImageData(snapshot.current, 0, 0);
    drawPencilSketch(ctx, pencilPoints.current, color, strokeWidth, opacity);

    // Incremental Sync
    const now = Date.now();
    if (now - lastEmitTime.current > 32) {
      currentSeq.current++;
      emitStrokeUpdate?.({
        strokeId: currentStrokeId.current,
        seq: currentSeq.current,
        points: [pt], // Send just the new point for efficiency
        x: pt.x, y: pt.y
      });
      lastEmitTime.current = now;
    }
  }

  else {
    ctx.putImageData(snapshot.current, 0, 0);
    ctx.beginPath();
    applyArrowDash(ctx);

    if (drawTool === "rect") {
      ctx.strokeRect(sx, sy, pt.x - sx, pt.y - sy);
      if (fillEnabled) {
        ctx.globalAlpha = fillOpacity / 100;
        ctx.fillStyle = fillColor;
        ctx.fillRect(sx, sy, pt.x - sx, pt.y - sy);
        ctx.globalAlpha = opacity / 100;
      }
    }
    else if (drawTool === "ellipse") {
      const rx = Math.abs(pt.x-sx)/2, ry = Math.abs(pt.y-sy)/2;
      const cx2 = sx+(pt.x-sx)/2, cy2 = sy+(pt.y-sy)/2;
      ctx.ellipse(cx2, cy2, rx, ry, 0, 0, 2*Math.PI); ctx.stroke();
      if (fillEnabled) {
        ctx.globalAlpha = fillOpacity/100;
        ctx.fillStyle = fillColor;
        ctx.beginPath(); ctx.ellipse(cx2, cy2, rx, ry, 0, 0, 2*Math.PI); ctx.fill();
        ctx.globalAlpha = opacity/100;
      }
    }
    else if (drawTool === "line") { ctx.moveTo(sx, sy); ctx.lineTo(pt.x, pt.y); ctx.stroke(); }
    else if (drawTool === "arrow") { drawArrow(ctx, sx, sy, pt.x, pt.y, arrowStyle === "curved"); }
    ctx.setLineDash([]);

    // Incremental Sync for Shapes
    const now = Date.now();
    if (now - lastEmitTime.current > 32) {
      currentSeq.current++;
      emitStrokeUpdate?.({
        strokeId: currentStrokeId.current,
        seq: currentSeq.current,
        x: pt.x, y: pt.y
      });
      lastEmitTime.current = now;
    }
  }

}, [activeTool, drawTool, eraserMode, eraserSize, color, strokeWidth, lineCap, opacity, canvasRef, zoom, onPanMove, toCanvas, fillColor, fillEnabled, fillOpacity, arrowStyle, emitStrokeUpdate]);

  const endDraw = useCallback(() => {
    if (activeTool==="hand") { onPanEnd(); return; }
    if (!drawing.current) return; drawing.current=false;
    pencilPoints.current = [];
    const canvas=canvasRef.current; if (!canvas) return;
    const ctx=canvas.getContext("2d");
    if (drawTool==="eraser") {
      if (eraserMode==="lasso" && lassoPath.current.length>3) {
        ctx.save();
        ctx.beginPath();
        const lp = lassoPath.current;
        ctx.moveTo(lp[0].x, lp[0].y);
        for (let i=1; i<lp.length; i++) {
          if (i < lp.length - 1) {
            const mx = (lp[i].x + lp[i+1].x) / 2;
            const my = (lp[i].y + lp[i+1].y) / 2;
            ctx.quadraticCurveTo(lp[i].x, lp[i].y, mx, my);
          } else { ctx.lineTo(lp[i].x, lp[i].y); }
        }
        ctx.closePath();
        ctx.globalCompositeOperation="destination-out";
        ctx.fillStyle="rgba(0,0,0,1)";
        ctx.fill();
        ctx.restore();
        lassoPath.current=[];
      } else if (eraserMode==="rect") {
        const s=startPt.current, e2=rectEnd.current; ctx.save();
        ctx.globalCompositeOperation="destination-out"; ctx.fillStyle="rgba(0,0,0,1)";
        ctx.fillRect(Math.min(s.x,e2.x),Math.min(s.y,e2.y),Math.abs(e2.x-s.x),Math.abs(e2.y-s.y)); ctx.restore();
      }
      const ov=overlayRef.current; if(ov) ov.getContext("2d").clearRect(0,0,ov.width,ov.height);
    }
    
    if (["pen", "pencil", "eraser"].includes(drawTool)) {
      if (drawTool === "pencil") {
        emitStrokeUpdate?.({
          strokeId: currentStrokeId.current,
          points: pencilPoints.current,
          final: true
        });
      }
      emitStrokeEnd?.({
        strokeId: currentStrokeId.current,
        userId: user?.userId
      });
    } else {
      // Shapes emit full state at the end
      emitStrokeStart?.({
        strokeId: currentStrokeId.current,
        tool: drawTool, isShape: true,
        startX: startPt.current.x, startY: startPt.current.y,
        endX: lastPt.current?.x || startPt.current.x,
        endY: lastPt.current?.y || startPt.current.y,
        color, strokeWidth, lineCap, opacity, fillColor, fillEnabled, fillOpacity, arrowStyle
      });
      emitStrokeEnd?.({ strokeId: currentStrokeId.current });
    }
    ctx.globalCompositeOperation="source-over"; ctx.globalAlpha=1; ctx.setLineDash([]);
  }, [activeTool, drawTool, eraserMode, eraserSize, canvasRef, onPanEnd, emitStrokeEnd, emitStrokeStart, emitStrokeUpdate, color, strokeWidth, lineCap, opacity, fillColor, fillEnabled, fillOpacity, arrowStyle]);

  // Handle remote strokes
  useEffect(() => {
    if (!onRemoteStrokeStart) return;

    onRemoteStrokeStart(data => {
      remoteStrokes.current.set(data.strokeId, {
        lastSeq: data.seq || 0,
        lastPoint: { x: data.x, y: data.y },
        config: data // Store color, width, etc.
      });
    });

    onRemoteStrokeUpdate(data => {
      const state = remoteStrokes.current.get(data.strokeId);
      if (!state) return;

      // 1. Out-of-order handling
      if (data.seq !== undefined && data.seq <= state.lastSeq) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const conf = state.config;

      ctx.save();
      
      // 2. Safe Rendering Pipeline
      if (conf.tool === "eraser" && conf.eraserMode === "freehand") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = conf.eraserSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 1;
        
        ctx.beginPath();
        ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      } else if (conf.tool === "pen") {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = conf.strokeWidth;
        ctx.strokeStyle = conf.color;
        ctx.lineCap = conf.lineCap || "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = (conf.opacity || 100) / 100;

        ctx.beginPath();
        ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      } else if (conf.tool === "pencil") {
        // Handle incremental pencil
        if (!state.pencilPoints) state.pencilPoints = [state.lastPoint];
        if (data.points) state.pencilPoints.push(...data.points);
        // Only redraw full sketch on final or occasionally to avoid flickering
        // For simplicity, we just use the line pipeline for pencil incremental, 
        // and redraw the sketch in endDraw or on large updates.
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = conf.strokeWidth * 0.7;
        ctx.strokeStyle = conf.color;
        ctx.lineCap = "round";
        ctx.globalAlpha = (conf.opacity || 100) / 100 * 0.7;

        ctx.beginPath();
        ctx.moveTo(state.lastPoint.x, state.lastPoint.y);
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      } else if (conf.isShape) {
        // Handle incremental shape preview
        // Since we don't have the receiver's background, we use the OVERLAY canvas for previews
        const ov = overlayRef.current;
        if (ov) {
          const oc = ov.getContext("2d");
          oc.clearRect(0, 0, ov.width, ov.height);
          oc.save();
          oc.globalCompositeOperation = "source-over";
          oc.lineWidth = conf.strokeWidth;
          oc.strokeStyle = conf.color;
          oc.globalAlpha = (conf.opacity || 100) / 100;
          
          const sx = conf.startX, sy = conf.startY, ex = data.x, ey = data.y;
          oc.beginPath();
          if (conf.tool === "rect") {
            oc.strokeRect(sx, sy, ex - sx, ey - sy);
            if (conf.fillEnabled) {
              oc.globalAlpha = conf.fillOpacity / 100;
              oc.fillStyle = conf.fillColor;
              oc.fillRect(sx, sy, ex - sx, ey - sy);
            }
          } else if (conf.tool === "ellipse") {
            const rx = Math.abs(ex-sx)/2, ry = Math.abs(ey-sy)/2;
            const cx2 = sx+(ex-sx)/2, cy2 = sy+(ey-sy)/2;
            oc.ellipse(cx2, cy2, rx, ry, 0, 0, 2*Math.PI); oc.stroke();
            if (conf.fillEnabled) {
              oc.globalAlpha = conf.fillOpacity/100;
              oc.fillStyle = conf.fillColor;
              oc.beginPath(); oc.ellipse(cx2, cy2, rx, ry, 0, 0, 2*Math.PI); oc.fill();
            }
          } else if (conf.tool === "line") {
            oc.moveTo(sx, sy); oc.lineTo(ex, ey); oc.stroke();
          } else if (conf.tool === "arrow") {
            drawArrow(oc, sx, sy, ex, ey, conf.arrowStyle === "curved");
          }
          oc.restore();
        }
      }

      ctx.restore();

      // 3. Update Stroke State
      state.lastSeq = data.seq ?? state.lastSeq;
      state.lastPoint = { x: data.x, y: data.y };
    });

    onRemoteStrokeEnd(data => {
      const state = remoteStrokes.current.get(data.strokeId);
      if (state && state.config.isShape) {
        // Draw the final shape on the main canvas and clear overlay
        const canvas = canvasRef.current;
        const ov = overlayRef.current;
        if (canvas && ov) {
          const ctx = canvas.getContext("2d");
          const conf = state.config;
          const ex = state.lastPoint.x, ey = state.lastPoint.y;
          const sx = conf.startX, sy = conf.startY;

          ctx.save();
          ctx.globalCompositeOperation = "source-over";
          ctx.lineWidth = conf.strokeWidth;
          ctx.strokeStyle = conf.color;
          ctx.globalAlpha = (conf.opacity || 100) / 100;
          
          ctx.beginPath();
          if (conf.tool === "rect") {
            ctx.strokeRect(sx, sy, ex - sx, ey - sy);
            if (conf.fillEnabled) {
              ctx.globalAlpha = conf.fillOpacity / 100;
              ctx.fillStyle = conf.fillColor;
              ctx.fillRect(sx, sy, ex - sx, ey - sy);
            }
          } else if (conf.tool === "ellipse") {
            const rx = Math.abs(ex-sx)/2, ry = Math.abs(ey-sy)/2;
            const cx2 = sx+(ex-sx)/2, cy2 = sy+(ey-sy)/2;
            ctx.ellipse(cx2, cy2, rx, ry, 0, 0, 2*Math.PI); ctx.stroke();
            if (conf.fillEnabled) {
              ctx.globalAlpha = conf.fillOpacity/100;
              ctx.fillStyle = conf.fillColor;
              ctx.beginPath(); ctx.ellipse(cx2, cy2, rx, ry, 0, 0, 2*Math.PI); ctx.fill();
            }
          } else if (conf.tool === "line") {
            ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
          } else if (conf.tool === "arrow") {
            drawArrow(ctx, sx, sy, ex, ey, conf.arrowStyle === "curved");
          }
          ctx.restore();
          ov.getContext("2d").clearRect(0, 0, ov.width, ov.height);
        }
      }
      remoteStrokes.current.delete(data.strokeId);
    });

  }, [onRemoteStrokeStart, onRemoteStrokeUpdate, onRemoteStrokeEnd, canvasRef]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      const W = parent.clientWidth, H = parent.clientHeight;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ov = overlayRef.current;
      if (ov) { ov.width=W; ov.height=H; }
    };
    resize(); const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [canvasRef]);

  useEffect(() => {
  const canvas = canvasRef.current;
  const overlay = overlayRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (overlay) {
    const octx = overlay.getContext("2d");
    octx.clearRect(0, 0, overlay.width, overlay.height);
  }
}, []);

  return (
    <div style={{ position:"fixed", inset:0, paddingTop:104, overflow:"hidden" }}>
      <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden",
          background: canvasBg || "#ffffff" }}>
       
        {/* Canvas with zoom/pan */}
        <div style={{ position:"absolute", inset:0, transformOrigin:"0 0", transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)` }}>
          <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", cursor:getCursor(), zIndex:2 }}
            onMouseDown={startDraw} onMouseMove={drawMove} onMouseUp={endDraw}
            onMouseLeave={()=>{ endDraw(); setCursor(c=>({...c,vis:false})); }}
            onMouseEnter={()=>setCursor(c=>({...c,vis:true}))}
            onTouchStart={startDraw} onTouchMove={drawMove} onTouchEnd={endDraw}/>
          <canvas ref={overlayRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:3}}/>
          {stickies.map(n=>(
            <StickyNote key={n.id} note={n} user={user} onMove={onMoveSticky} onResize={onResizeSticky} onChangeColor={onChangeColorSticky} onDelete={onDeleteSticky} onTextChange={onTextChangeSticky}/>
          ))}
        </div>
        {/* Custom cursors */}
        {cursor.vis && drawTool==="eraser" && eraserMode==="freehand" && (
          <div style={{ position:"fixed", left:cursor.x-eraserSize*zoom/2, top:cursor.y-eraserSize*zoom/2,
              width:eraserSize*zoom, height:eraserSize*zoom, borderRadius:3,
              border:"1.5px dashed rgba(139,92,246,0.65)", pointerEvents:"none", zIndex:200 }}/>
        )}
        {cursor.vis && (drawTool==="pen"||drawTool==="pencil") && (
          <div style={{ position:"fixed", left:cursor.x-12, top:cursor.y-12, width:24, height:24,
              borderRadius:"50%", background:color, opacity: drawTool==="pencil"?.1:.15,
              pointerEvents:"none", zIndex:200, filter:`blur(${drawTool==="pencil"?8:5}px)` }}/>
        )}
        <EmptyState/>
      </div>
    </div>
  );
};
