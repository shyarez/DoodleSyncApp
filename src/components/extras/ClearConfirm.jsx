export const ClearConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.28)",backdropFilter:"blur(4px)"}}/>
    <div className="pop-in" style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:201,
        background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:18,padding:"28px 34px",width:300,textAlign:"center",boxShadow:"0 8px 40px var(--shadow)" }}>
      <div style={{fontSize:36,marginBottom:10}}>🗑️</div>
      <p style={{fontFamily:"'Caveat',cursive",fontSize:22,fontWeight:700,color:"var(--text)",marginBottom:6}}>Clear Canvas?</p>
      <p style={{fontSize:12,color:"var(--text2)",marginBottom:22,fontFamily:"'Poppins',system-ui",lineHeight:1.5}}>This will erase everything. This can't be undone.</p>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:"9px",borderRadius:11,border:"1px solid var(--border)",background:"transparent",fontSize:12,fontWeight:600,color:"var(--text2)",cursor:"pointer",fontFamily:"'Poppins',system-ui"}}>Cancel</button>
        <button onClick={onConfirm} style={{flex:1,padding:"9px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#f87171,#fb923c)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 14px rgba(248,113,113,0.4)",fontFamily:"'Poppins',system-ui"}}>Clear</button>
      </div>
    </div>
  </>
);
