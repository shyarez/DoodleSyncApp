import { useState, useEffect, useRef } from "react";
import { STICKY_PRESETS } from "../../data/constants.js";

export const StickyNote = ({ note, onMove, onResize, onChangeColor, onDelete, onTextChange }) => {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [focused, setFocused] = useState(note.fresh);
  const [showPalette, setShowPalette] = useState(false);
  const dragOff = useRef({ x:0, y:0 });
  const textRef = useRef(null);

  // Drag
  const onHeaderDown = (e) => {
    if (e.target.closest("[data-no-drag]")) return;
    e.preventDefault(); e.stopPropagation();
    setDragging(true);
    dragOff.current = { x: e.clientX - note.x, y: e.clientY - note.y };
  };
  useEffect(() => {
    if (!dragging) return;
    const mv = (e) => onMove(note.id, { x: e.clientX - dragOff.current.x, y: e.clientY - dragOff.current.y });
    const up = () => setDragging(false);
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [dragging, note.id, onMove]);

  // Resize
  const onResizeDown = (e, edge) => {
    e.preventDefault(); e.stopPropagation();
    setResizing({ edge, startX:e.clientX, startY:e.clientY, startW:note.w, startH:note.h, startNX:note.x, startNY:note.y });
  };
  useEffect(() => {
    if (!resizing) return;
    const mv = (e) => {
      const dx = e.clientX - resizing.startX, dy = e.clientY - resizing.startY;
      const edge = resizing.edge;
      let newW = resizing.startW, newH = resizing.startH, newX = resizing.startNX, newY = resizing.startNY;
      if (edge.includes("e")) newW = Math.max(120, resizing.startW + dx);
      if (edge.includes("s")) newH = Math.max(90,  resizing.startH + dy);
      if (edge.includes("w")) { newW = Math.max(120, resizing.startW - dx); newX = resizing.startNX + (resizing.startW - newW); }
      if (edge.includes("n")) { newH = Math.max(90,  resizing.startH - dy); newY = resizing.startNY + (resizing.startH - newH); }
      onResize(note.id, { w:newW, h:newH, x:newX, y:newY });
    };
    const up = () => setResizing(null);
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [resizing, note.id, onResize]);

  useEffect(() => { if (note.fresh && textRef.current) { textRef.current.focus(); } }, [note.fresh]);

  const handles = [
    { edge:"n",  style:{top:-4,left:"50%",transform:"translateX(-50%)",width:36,height:8,cursor:"n-resize"} },
    { edge:"s",  style:{bottom:-4,left:"50%",transform:"translateX(-50%)",width:36,height:8,cursor:"s-resize"} },
    { edge:"e",  style:{right:-4,top:"50%",transform:"translateY(-50%)",width:8,height:36,cursor:"e-resize"} },
    { edge:"w",  style:{left:-4,top:"50%",transform:"translateY(-50%)",width:8,height:36,cursor:"w-resize"} },
    { edge:"se", style:{bottom:-5,right:-5,width:14,height:14,cursor:"se-resize",borderRadius:"0 0 4px 0"} },
    { edge:"sw", style:{bottom:-5,left:-5,width:14,height:14,cursor:"sw-resize",borderRadius:"0 0 0 4px"} },
    { edge:"ne", style:{top:-5,right:-5,width:14,height:14,cursor:"ne-resize",borderRadius:"0 4px 0 0"} },
    { edge:"nw", style:{top:-5,left:-5,width:14,height:14,cursor:"nw-resize",borderRadius:"4px 0 0 0"} },
  ];

  return (
    <div style={{ position:"absolute", left:note.x, top:note.y, width:note.w, height:note.h, zIndex:focused?25:20, userSelect:"none",
        filter: focused ? "drop-shadow(0 6px 20px rgba(100,70,180,0.22))" : "drop-shadow(2px 4px 12px rgba(0,0,0,0.12))",
        transform: focused ? "scale(1.015)" : "scale(1)", transition:"transform 0.15s, filter 0.15s" }}>
      {handles.map(h => (
        <div key={h.edge} onMouseDown={e=>onResizeDown(e,h.edge)}
          style={{position:"absolute",zIndex:10,background:"transparent", ...h.style}}/>
      ))}
      <div style={{ width:"100%", height:"100%", background:note.color, borderRadius:6,
          border: focused ? "2px solid rgba(139,92,246,0.5)" : "2px solid transparent",
          display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div onMouseDown={onHeaderDown} style={{ background:"rgba(0,0,0,0.07)", padding:"5px 8px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:dragging?"grabbing":"grab", flexShrink:0 }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.08em", color:"rgba(0,0,0,0.4)", textTransform:"uppercase", fontFamily:"'Poppins',system-ui" }}>✎ Note</span>
          <div data-no-drag="1" style={{display:"flex",gap:3}}>
            <button onClick={()=>setShowPalette(p=>!p)} style={{border:"none",background:"none",cursor:"pointer",width:14,height:14,borderRadius:"50%",background:note.color,border:"1.5px solid rgba(0,0,0,0.2)"}}/>
            <button onClick={()=>onDelete(note.id)} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:"rgba(0,0,0,0.4)",lineHeight:1,padding:"0 1px"}}>×</button>
          </div>
        </div>
        {showPalette && (
          <div data-no-drag="1" style={{ position:"absolute",top:28,right:4,zIndex:30,background:"white",borderRadius:10,padding:8,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",display:"flex",gap:5,flexWrap:"wrap",width:120 }}>
            {STICKY_PRESETS.map(c=>(
              <button key={c} onClick={()=>{onChangeColor(note.id,c);setShowPalette(false);}}
                style={{width:20,height:20,borderRadius:5,background:c,border:note.color===c?"2px solid #7c3aed":"2px solid transparent",cursor:"pointer"}}/>
            ))}
          </div>
        )}
        <div ref={textRef} contentEditable suppressContentEditableWarning
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          onInput={e=>onTextChange(note.id, e.currentTarget.textContent)}
          style={{ flex:1, padding:"8px 10px", outline:"none", fontSize:14, color:"rgba(0,0,0,0.72)", fontFamily:"'Poppins',system-ui", lineHeight:1.55, wordBreak:"break-word", overflowY:"auto", cursor:"text" }}
          dangerouslySetInnerHTML={undefined}>
          {note.text || ""}
        </div>
      </div>
    </div>
  );
};
