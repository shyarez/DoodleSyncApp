import { CANVAS_BG_LIGHT, CANVAS_BG_DARK } from "../../data/constants.js";

export const BgPicker = ({ dark, canvasBg, setCanvasBg }) => {
  const options = dark ? CANVAS_BG_DARK : CANVAS_BG_LIGHT;
  return (
    <div className="fade-down" style={{ position:"absolute", top:"calc(100% + 10px)", right:0,
        background:"var(--toolbar)", border:"1px solid var(--border)", borderRadius:16, padding:"12px 13px", width:196,
        boxShadow:"0 8px 32px var(--shadow)", zIndex:500 }}>
      <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Poppins',system-ui"}}>Canvas Background</p>
      {options.map(opt => (
        <button key={opt.id} onClick={()=>setCanvasBg(opt.color)}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"7px 8px", borderRadius:9,
            border:`1.5px solid ${canvasBg===opt.color?"var(--accent)":"transparent"}`,
            background:canvasBg===opt.color?"rgba(139,92,246,0.08)":"transparent",
            cursor:"pointer", marginBottom:3, transition:"all 0.13s" }}>
          <div style={{ width:20, height:20, borderRadius:5, background:opt.color, flexShrink:0, border:"1.5px solid rgba(128,128,128,0.2)" }} />
          <span style={{fontSize:12,fontWeight:500,color:"var(--text2)",fontFamily:"'Poppins',system-ui"}}>{opt.label}</span>
          {canvasBg===opt.color && <span style={{marginLeft:"auto",fontSize:11,color:"var(--accent)"}}>✓</span>}
        </button>
      ))}
    </div>
  );
};
