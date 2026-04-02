import { UndoIcon, RedoIcon, ZoomInIcon, ZoomOutIcon } from "../../icons/index.jsx";
import { Divider } from "../ui/Divider.jsx";

export const ZoomControls = ({ zoom, setZoom, onUndo, onRedo }) => (
  <div style={{ position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",zIndex:60,
      display:"flex",alignItems:"center",gap:2,padding:"4px 8px",borderRadius:12,
      background:"var(--toolbar)",border:"1px solid var(--border)",boxShadow:"0 4px 20px var(--shadow)" }}>
    <button title="Undo (Ctrl+Z)" onClick={onUndo} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--text2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.14s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><UndoIcon/></button>
    <button title="Redo (Ctrl+Y)" onClick={onRedo} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--text2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.14s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><RedoIcon/></button>
    <Divider/>
    <button title="Zoom out" onClick={()=>setZoom(z=>Math.max(0.25,+(z-0.1).toFixed(2)))} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--text2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.14s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><ZoomOutIcon/></button>
    <button onClick={()=>setZoom(1)} style={{minWidth:52,height:30,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--text2)",fontSize:11,fontWeight:600,fontFamily:"'Poppins',system-ui",transition:"background 0.14s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{Math.round(zoom*100)}%</button>
    <button title="Zoom in" onClick={()=>setZoom(z=>Math.min(4,+(z+0.1).toFixed(2)))} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:"transparent",color:"var(--text2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.14s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><ZoomInIcon/></button>
  </div>
);
