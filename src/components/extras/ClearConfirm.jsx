import { FiTrash2 } from "react-icons/fi";

export const ClearConfirm = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.28)",backdropFilter:"blur(4px)"}}/>
    <div className="pop-in" style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:201,
        background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:18,padding:"28px 34px",width:300,textAlign:"center",boxShadow:"0 8px 40px var(--shadow)" }}>
      <div style={{color:"#f87171",marginBottom:10}}><FiTrash2 size={36}/></div>
      <p style={{fontFamily:"var(--font-ui)",fontSize:20,fontWeight:700,color:"var(--text)",marginBottom:6,letterSpacing:-0.5}}>Clear Canvas?</p>
      <p style={{fontSize:12,color:"var(--text2)",marginBottom:22,fontFamily:"var(--font-ui)",lineHeight:1.5}}>This will erase everything currently shared. This can't be undone.</p>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:11,border:"1px solid var(--border)",background:"transparent",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer",fontFamily:"var(--font-ui)"}}>Cancel</button>
        <button onClick={onConfirm} style={{flex:1,padding:"10px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#f87171,#fb923c)",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 14px rgba(248,113,113,0.4)",fontFamily:"var(--font-ui)"}}>Clear Board</button>
      </div>
    </div>
  </>
);
