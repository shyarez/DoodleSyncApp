import { SHAPES, ARROW_STYLES } from "../../data/constants.js";
import { TOOL_ICONS } from "../../icons/index.jsx";

export const ShapeDropdown = ({ activeShape, setActiveShape, setActiveTool, fillColor, setFillColor, fillEnabled, setFillEnabled, fillOpacity, setFillOpacity, arrowStyle, setArrowStyle, onClose }) => (
  <div className="fade-down" style={{ position:"absolute", top:"calc(100% + 10px)", left:"50%", transform:"translateX(-50%)",
      background:"var(--toolbar)", border:"1px solid var(--border)", borderRadius:16, padding:"12px 13px", width:230,
      boxShadow:"0 8px 32px var(--shadow)", zIndex:500 }}>
    <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Poppins',system-ui"}}>Shape</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:12}}>
      {SHAPES.map(s => (
        <button key={s.id} title={s.label} onClick={()=>{ setActiveShape(s.id); setActiveTool("shape"); onClose(); }}
          style={{ height:34, borderRadius:9, border:`1.5px solid ${activeShape===s.id?"var(--accent)":"var(--border)"}`,
            background:activeShape===s.id?"rgba(139,92,246,0.12)":"transparent",
            cursor:"pointer", color:activeShape===s.id?"var(--accent)":"var(--text2)",
            display:"flex",alignItems:"center",justifyContent:"center", transition:"all 0.13s" }}>
          {TOOL_ICONS[s.id]}
        </button>
      ))}
    </div>

    {/* Fill options */}
    <div style={{borderTop:"1px solid var(--border)",paddingTop:10,marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
        <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",fontFamily:"'Poppins',system-ui"}}>Fill</p>
        <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
          <div onClick={()=>setFillEnabled(v=>!v)} style={{ width:28,height:16,borderRadius:8,background:fillEnabled?"var(--accent)":"var(--border)",position:"relative",transition:"background 0.2s",cursor:"pointer",flexShrink:0 }}>
            <div style={{ position:"absolute",top:2,left:fillEnabled?14:2,width:12,height:12,borderRadius:"50%",background:"white",transition:"left 0.18s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
          </div>
          <span style={{fontSize:11,color:"var(--text2)",fontFamily:"'Poppins',system-ui"}}>{fillEnabled?"On":"Off"}</span>
        </label>
      </div>
      {fillEnabled && (
        <>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
            <div style={{width:20,height:20,borderRadius:5,background:fillColor,border:"1.5px solid rgba(0,0,0,0.12)",flexShrink:0}}/>
            <input type="color" value={fillColor} onChange={e=>setFillColor(e.target.value)} style={{width:24,height:24,border:"none",background:"none",cursor:"pointer",padding:0}}/>
            <span style={{fontSize:10,color:"var(--text2)",fontFamily:"monospace",letterSpacing:"0.04em"}}>{fillColor}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:10,color:"var(--text2)",fontFamily:"'Poppins',system-ui",flexShrink:0}}>Opacity</span>
            <input type="range" min={5} max={100} value={fillOpacity} onChange={e=>setFillOpacity(+e.target.value)} style={{flex:1}}/>
            <span style={{fontSize:10,fontWeight:600,color:"var(--text2)",minWidth:28,fontFamily:"'Poppins',system-ui"}}>{fillOpacity}%</span>
          </div>
        </>
      )}
    </div>

    {/* Arrow style (only for arrow shape) */}
    {activeShape === "arrow" && (
      <div style={{borderTop:"1px solid var(--border)",paddingTop:10}}>
        <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:7,fontFamily:"'Poppins',system-ui"}}>Arrow Style</p>
        <div style={{display:"flex",gap:5}}>
          {ARROW_STYLES.map(s => (
            <button key={s.id} onClick={()=>setArrowStyle(s.id)}
              style={{ flex:1, padding:"6px 0", borderRadius:9, border:`1.5px solid ${arrowStyle===s.id?"var(--accent)":"var(--border)"}`,
                background:arrowStyle===s.id?"rgba(139,92,246,0.1)":"transparent", cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center", transition:"all 0.13s" }}>
              <svg width={28} height={8} viewBox="0 0 28 8">
                <line x1="2" y1="4" x2="22" y2="4" stroke={arrowStyle===s.id?"var(--accent)":"var(--text2)"} strokeWidth="1.8" strokeLinecap="round"
                  strokeDasharray={s.dash.join(",")||"none"}/>
                <polyline points="18,1 24,4 18,7" fill="none" stroke={arrowStyle===s.id?"var(--accent)":"var(--text2)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
        <div style={{marginTop:8}}>
          <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:6,fontFamily:"'Poppins',system-ui"}}>Style</p>
          <div style={{display:"flex",gap:5}}>
            {[["straight","Straight"],["curved","Curved"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setArrowStyle(id==="curved"?(arrowStyle==="curved"?ARROW_STYLES.find(s=>s.id!=="curved")?.id||"solid":"curved"):arrowStyle)}
                style={{flex:1,padding:"5px",borderRadius:8,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",fontSize:10,color:"var(--text2)",fontFamily:"'Poppins',system-ui"}}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);
