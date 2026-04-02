import { ERASER_MODES } from "../../data/constants.js";

export const EraserMenu = ({ eraserMode, setEraserMode, eraserSize, setEraserSize, onClose }) => (
  <div className="fade-down" style={{ position:"absolute",top:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:16,padding:"12px 13px",width:226,boxShadow:"0 8px 32px var(--shadow)",zIndex:500 }}>
    <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:9,fontFamily:"'Poppins',system-ui"}}>Eraser Mode</p>
    {ERASER_MODES.map(m=>(
      <div key={m.id} onClick={()=>{setEraserMode(m.id);onClose();}} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:10,cursor:"pointer",marginBottom:4,background:eraserMode===m.id?"rgba(139,92,246,0.1)":"transparent",border:`1px solid ${eraserMode===m.id?"rgba(139,92,246,0.3)":"transparent"}`,transition:"all 0.12s"}} onMouseEnter={e=>{if(eraserMode!==m.id)e.currentTarget.style.background="rgba(139,92,246,0.05)"}} onMouseLeave={e=>{if(eraserMode!==m.id)e.currentTarget.style.background="transparent"}}>
        <div style={{flex:1}}>
          <p style={{fontSize:12,fontWeight:600,color:"var(--text)",fontFamily:"'Poppins',system-ui"}}>{m.label}</p>
          <p style={{fontSize:10,color:"var(--text2)",fontFamily:"'Poppins',system-ui"}}>{m.desc}</p>
        </div>
        {eraserMode===m.id&&<span style={{color:"var(--accent)",fontSize:12}}>✓</span>}
      </div>
    ))}
    <div style={{borderTop:"1px solid var(--border)",marginTop:8,paddingTop:8}}>
      <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:7,fontFamily:"'Poppins',system-ui"}}>Eraser Size</p>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <input type="range" min={4} max={80} value={eraserSize} onChange={e=>setEraserSize(+e.target.value)} style={{flex:1}}/>
        <span style={{fontSize:11,fontWeight:600,color:"var(--text2)",minWidth:24,fontFamily:"'Poppins',system-ui"}}>{eraserSize}</span>
      </div>
    </div>
  </div>
);
