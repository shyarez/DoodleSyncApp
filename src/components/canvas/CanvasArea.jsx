import { useState, useRef, useEffect, useCallback } from "react";
import { ARROW_STYLES } from "../../data/constants.js";
import { StickyNote } from "./StickyNote.jsx";
import { EmptyState } from "./EmptyState.jsx";

export const CanvasArea = ({ activeTool, color, strokeWidth, opacity, lineCap, eraserMode, eraserSize,
    canvasRef, stickies, onAddSticky, onMoveSticky, onResizeSticky, onChangeColorSticky, onDeleteSticky, onTextChangeSticky,
    zoom, pan, onPanStart, onPanMove, onPanEnd,
    activeShape, fillColor, fillEnabled, fillOpacity, arrowStyle, canvasBg }) => {
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
    const ctx = canvas.getContext("2d");
    const pt = toCanvas(e, canvas);
    drawing.current = true; startPt.current = pt;
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (drawTool==="pen") { ctx.beginPath(); ctx.moveTo(pt.x, pt.y); }
    else if (drawTool==="pencil") { pencilPoints.current = [pt]; }
    else if (drawTool==="eraser") {
      if (eraserMode==="freehand") { ctx.beginPath(); ctx.moveTo(pt.x, pt.y); }
      else if (eraserMode==="lasso") lassoPath.current = [pt];
      else if (eraserMode==="rect") { rectEnd.current = pt; }
    }
  }, [activeTool, drawTool, eraserMode, canvasRef, onAddSticky, onPanStart, toCanvas]);

  const drawMove = useCallback(e => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (activeTool==="hand") { onPanMove(e); return; }
    const pt = toCanvas(e, canvas);
    setCursor({ x: (e.touches?e.touches[0]:e).clientX, y: (e.touches?e.touches[0]:e).clientY, vis:true });
    if (!drawing.current) return;
    const ctx = canvas.getContext("2d");
    if (drawTool==="eraser") {
      if (eraserMode==="freehand") {
        ctx.globalCompositeOperation="destination-out"; ctx.lineWidth=eraserSize; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.globalAlpha=1;
        ctx.lineTo(pt.x,pt.y); ctx.stroke();
      } else if (eraserMode==="lasso") {
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
          } else { oc.lineTo(lp[i].x, lp[i].y); }
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
      } else if (eraserMode==="rect") {
        rectEnd.current = pt;
        const ov = overlayRef.current; if (!ov) return;
        const oc = ov.getContext("2d"); const s=startPt.current;
        oc.clearRect(0,0,ov.width,ov.height); oc.strokeStyle="rgba(139,92,246,0.7)"; oc.lineWidth=1.5/zoom; oc.setLineDash([5/zoom,4/zoom]);
        oc.beginPath(); oc.strokeRect(s.x,s.y,pt.x-s.x,pt.y-s.y); oc.setLineDash([]);
      }
      return;
    }
    ctx.globalCompositeOperation="source-over";
    ctx.strokeStyle=color; ctx.lineWidth=strokeWidth;
    ctx.lineCap=lineCap; ctx.lineJoin="round"; ctx.globalAlpha=opacity/100;
    const sx=startPt.current.x, sy=startPt.current.y;

    if (drawTool==="pen") {
      ctx.lineTo(pt.x,pt.y); ctx.stroke();
    } else if (drawTool==="pencil") {
      pencilPoints.current.push(pt);
      ctx.putImageData(snapshot.current, 0, 0);
      drawPencilSketch(ctx, pencilPoints.current, color, strokeWidth, opacity);
    } else {
      ctx.putImageData(snapshot.current, 0, 0); ctx.beginPath();
      applyArrowDash(ctx);
      if (drawTool==="rect") {
        ctx.strokeRect(sx,sy,pt.x-sx,pt.y-sy);
        if (fillEnabled) {
          ctx.globalAlpha = fillOpacity/100;
          ctx.fillStyle = fillColor;
          ctx.fillRect(sx,sy,pt.x-sx,pt.y-sy);
          ctx.globalAlpha = opacity/100;
        }
      } else if (drawTool==="ellipse") {
        const rx=Math.abs(pt.x-sx)/2, ry=Math.abs(pt.y-sy)/2;
        const cx2=sx+(pt.x-sx)/2, cy2=sy+(pt.y-sy)/2;
        ctx.ellipse(cx2,cy2,rx,ry,0,0,2*Math.PI); ctx.stroke();
        if (fillEnabled) {
          ctx.globalAlpha = fillOpacity/100;
          ctx.fillStyle = fillColor;
          ctx.beginPath(); ctx.ellipse(cx2,cy2,rx,ry,0,0,2*Math.PI); ctx.fill();
          ctx.globalAlpha = opacity/100;
        }
      } else if (drawTool==="line") {
        ctx.moveTo(sx,sy); ctx.lineTo(pt.x,pt.y); ctx.stroke();
      } else if (drawTool==="arrow") {
        const curved = arrowStyle === "curved";
        drawArrow(ctx, sx, sy, pt.x, pt.y, curved);
      }
      ctx.setLineDash([]);
    }
  }, [activeTool, drawTool, eraserMode, eraserSize, color, strokeWidth, lineCap, opacity, canvasRef, zoom, onPanMove, toCanvas, fillColor, fillEnabled, fillOpacity, arrowStyle]);

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
    ctx.globalCompositeOperation="source-over"; ctx.globalAlpha=1; ctx.setLineDash([]);
  }, [activeTool, drawTool, eraserMode, canvasRef, onPanEnd]);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      const W = parent.clientWidth, H = parent.clientHeight;
      const imgData = canvas.width>0 ? canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height) : null;
      canvas.width = W; canvas.height = H;
      if (imgData) canvas.getContext("2d").putImageData(imgData,0,0);
      const ov = overlayRef.current;
      if (ov) { ov.width=W; ov.height=H; }
    };
    resize(); const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [canvasRef]);

  return (
    <div style={{ position:"fixed", inset:0, paddingTop:104, overflow:"hidden" }}>
      <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden",
          background: canvasBg || "var(--canvas-bg)" }}>
        {/* Dot grid */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:1,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width={26*zoom} height={26*zoom} patternUnits="userSpaceOnUse" x={pan.x%(26*zoom)} y={pan.y%(26*zoom)}>
              <circle cx={13*zoom} cy={13*zoom} r="1" fill="var(--dot)" fillOpacity="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
        {/* Canvas with zoom/pan */}
        <div style={{ position:"absolute", inset:0, transformOrigin:"0 0", transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)` }}>
          <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", cursor:getCursor(), zIndex:2 }}
            onMouseDown={startDraw} onMouseMove={drawMove} onMouseUp={endDraw}
            onMouseLeave={()=>{ endDraw(); setCursor(c=>({...c,vis:false})); }}
            onMouseEnter={()=>setCursor(c=>({...c,vis:true}))}
            onTouchStart={startDraw} onTouchMove={drawMove} onTouchEnd={endDraw}/>
          <canvas ref={overlayRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:3}}/>
          {stickies.map(n=>(
            <StickyNote key={n.id} note={n} onMove={onMoveSticky} onResize={onResizeSticky} onChangeColor={onChangeColorSticky} onDelete={onDeleteSticky} onTextChange={onTextChangeSticky}/>
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
