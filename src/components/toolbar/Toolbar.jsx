import { useState, useEffect, useRef } from "react";
import { TOOLS } from "../../data/constants.js";
import { TOOL_ICONS, ShapeIcon, ChevronDown, BgIcon } from "../../icons/index.jsx";
import { Divider } from "../ui/Divider.jsx";
import { ColorPicker } from "./ColorPicker.jsx";
import { StrokeMenu } from "./StrokeMenu.jsx";
import { EraserMenu } from "./EraserMenu.jsx";
import { ShapeDropdown } from "./ShapeDropdown.jsx";
import { BgPicker } from "./BgPicker.jsx";

export const Toolbar = ({ activeTool, setActiveTool, color, setColor, paletteMode, setPaletteMode,
    strokeWidth, setStrokeWidth, opacity, setOpacity, lineCap, setLineCap,
    eraserMode, setEraserMode, eraserSize, setEraserSize,
    activeShape, setActiveShape, fillColor, setFillColor, fillEnabled, setFillEnabled, fillOpacity, setFillOpacity,
    arrowStyle, setArrowStyle, canvasBg, setCanvasBg, dark }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleTool = (id) => {
    if (id === "shape") {
      setActiveTool("shape");
      setOpenMenu(m => m === "shape" ? null : "shape");
    } else if (id === "eraser") {
      setActiveTool("eraser");
      setOpenMenu(m => m === "eraser" ? null : "eraser");
    } else {
      setActiveTool(id);
      setOpenMenu(null);
    }
  };

  const shapeIcon = TOOL_ICONS[activeShape] || <ShapeIcon/>;
  const isShapeActive = ["rect","ellipse","line","arrow","shape"].includes(activeTool) || activeTool === "shape";

  const toolBtn = (t) => {
    const isActive = t.id === "shape" ? isShapeActive : activeTool === t.id;
    const icon = t.id === "shape" ? shapeIcon : TOOL_ICONS[t.id];
    return (
      <button
        key={t.id}
        title={`${t.label} (${t.key.toUpperCase()})`}
        onClick={() => handleTool(t.id)}
        style={{
          width: 34, height: 34, borderRadius: 9, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: isActive ? "var(--accent)" : "transparent",
          color: isActive ? "white" : "var(--text2)",
          boxShadow: isActive ? "0 2px 10px rgba(139,92,246,0.4)" : "none",
          transform: isActive ? "scale(1.06)" : "scale(1)",
          transition: "background 0.14s, transform 0.12s, box-shadow 0.14s",
          lineHeight: 0, position: "relative",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        {icon}
        {t.id === "shape" && (
          <span style={{ position:"absolute", bottom:2, right:2, lineHeight:0, color: isActive?"rgba(255,255,255,0.7)":"var(--text2)", opacity:.7 }}>
            <ChevronDown/>
          </span>
        )}
      </button>
    );
  };

  const navTools  = TOOLS.filter(t => t.id === "hand");
  const drawTools = TOOLS.filter(t => t.id !== "select" && t.id !== "hand");

  return (
    <div ref={ref} style={{
        position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)", zIndex: 60,
        display: "flex", alignItems: "center", gap: 2, padding: "5px 8px", borderRadius: 14,
        background: dark ? "#141414" : "#ffffff", border: "1px solid var(--border)",
        boxShadow: "0 4px 24px var(--shadow)", height: 46,
        isolation: "isolate", fontFamily: "var(--font-ui)",
    }}>
      {navTools.map(t => (
        <div key={t.id} style={{ position:"relative" }}>{toolBtn(t)}</div>
      ))}
      <Divider/>
      {drawTools.map(t => (
        <div key={t.id} style={{ position:"relative" }}>
          {toolBtn(t)}
          {t.id === "eraser" && openMenu === "eraser" && (
            <EraserMenu eraserMode={eraserMode} setEraserMode={setEraserMode}
              eraserSize={eraserSize} setEraserSize={setEraserSize} onClose={() => setOpenMenu(null)} />
          )}
          {t.id === "shape" && openMenu === "shape" && (
            <ShapeDropdown
              activeShape={activeShape} setActiveShape={setActiveShape} setActiveTool={setActiveTool}
              fillColor={fillColor} setFillColor={setFillColor}
              fillEnabled={fillEnabled} setFillEnabled={setFillEnabled}
              fillOpacity={fillOpacity} setFillOpacity={setFillOpacity}
              arrowStyle={arrowStyle} setArrowStyle={setArrowStyle}
              onClose={() => setOpenMenu(null)}
            />
          )}
        </div>
      ))}
      <Divider/>
      {/* Color swatch */}
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <button title="Color palette (C)" onClick={() => setOpenMenu(m => m === "color" ? null : "color")}
          style={{
            width:34, height:34, borderRadius:9, flexShrink:0, cursor:"pointer",
            border:`2.5px solid ${openMenu==="color"?"var(--accent)":"var(--border)"}`,
            background:color,
            boxShadow:openMenu==="color"?"0 0 0 3px rgba(139,92,246,0.25)":"none",
            transition:"border-color 0.15s,box-shadow 0.15s",
          }} />
        {openMenu === "color" && (
          <ColorPicker color={color} setColor={setColor} paletteMode={paletteMode} setPaletteMode={setPaletteMode} />
        )}
      </div>
      {/* Stroke settings */}
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <button title="Stroke & opacity" onClick={() => setOpenMenu(m => m === "stroke" ? null : "stroke")}
          style={{
            width:34, height:34, borderRadius:9, flexShrink:0, cursor:"pointer",
            border:`1.5px solid ${openMenu==="stroke"?"var(--accent)":"var(--border)"}`,
            background:openMenu==="stroke"?"rgba(139,92,246,0.08)":"transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.14s",
          }}>
          <div style={{
            width:strokeWidth>20?16:strokeWidth>10?12:8,
            height:Math.min(strokeWidth,4),
            background:color, borderRadius:lineCap==="round"?99:1, opacity:opacity/100,
          }} />
        </button>
        {openMenu === "stroke" && (
          <StrokeMenu color={color} strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
            opacity={opacity} setOpacity={setOpacity} lineCap={lineCap} setLineCap={setLineCap} />
        )}
      </div>
      {/* Canvas background */}
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <button title="Canvas background" onClick={() => setOpenMenu(m => m === "bg" ? null : "bg")}
          style={{ width:34, height:34, borderRadius:9, border:`1.5px solid ${openMenu==="bg"?"var(--accent)":"var(--border)"}`,
            background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            color:openMenu==="bg"?"var(--accent)":"var(--text2)", transition:"all 0.14s" }}>
          <BgIcon/>
        </button>
        {openMenu === "bg" && <BgPicker dark={dark} canvasBg={canvasBg} setCanvasBg={setCanvasBg}/>}
      </div>
    </div>
  );
};
