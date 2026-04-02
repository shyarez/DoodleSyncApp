export const StrokeMenu = ({ color, strokeWidth, setStrokeWidth, opacity, setOpacity, lineCap, setLineCap }) => (
  <div className="fade-down" style={{ position:"absolute",top:"calc(100% + 10px)",right:0,background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:16,padding:"12px 13px",width:198,boxShadow:"0 8px 32px var(--shadow)",zIndex:500 }}>
    <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Poppins',system-ui"}}>Stroke Width</p>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <input type="range" min={1} max={40} value={strokeWidth} onChange={e=>setStrokeWidth(+e.target.value)} style={{flex:1}}/>
      <span style={{fontSize:11,fontWeight:600,color:"var(--text2)",minWidth:22,fontFamily:"'Poppins',system-ui"}}>{strokeWidth}</span>
    </div>
    <div style={{height:20,display:"flex",alignItems:"center",marginBottom:12,background:"var(--bg2)",borderRadius:6,padding:"0 8px"}}>
      <div style={{width:"100%",height:Math.min(strokeWidth,14),background:color,borderRadius:lineCap==="round"?99:2,opacity:opacity/100}}/>
    </div>
    <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Poppins',system-ui"}}>Cap Style</p>
    <div style={{display:"flex",gap:5,marginBottom:10}}>
      {[["round","●"],["butt","▬"],["square","■"]].map(([id,ico])=>(
        <button key={id} onClick={()=>setLineCap(id)} style={{flex:1,padding:"5px",borderRadius:8,border:`1px solid ${lineCap===id?"var(--accent)":"var(--border)"}`,background:lineCap===id?"rgba(139,92,246,0.1)":"transparent",cursor:"pointer",fontSize:14,color:lineCap===id?"var(--accent)":"var(--text2)",transition:"all 0.12s"}}>{ico}</button>
      ))}
    </div>
    <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:7,fontFamily:"'Poppins',system-ui"}}>Opacity</p>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <input type="range" min={10} max={100} value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{flex:1}}/>
      <span style={{fontSize:11,fontWeight:600,color:"var(--text2)",minWidth:32,fontFamily:"'Poppins',system-ui"}}>{opacity}%</span>
    </div>
  </div>
);
