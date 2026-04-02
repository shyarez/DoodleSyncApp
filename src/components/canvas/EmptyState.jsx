import { useState } from "react";

export const EmptyState = () => {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <div className="fade-up" onClick={()=>setGone(true)} style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:5,pointerEvents:"auto",cursor:"pointer" }}>
      <div style={{ background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:20,padding:"32px 50px",textAlign:"center",maxWidth:380,boxShadow:"0 8px 40px var(--shadow)" }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:14}}>
          <svg width={32} height={32} viewBox="0 0 24 68" opacity=".6">
            <rect x="10" y="0" width="4" height="36" rx="2" fill="#e879a0"/>
            <ellipse cx="12" cy="44" rx="5" ry="7" fill="#e879a0"/>
            <ellipse cx="12" cy="52" rx="3.5" ry="5" fill="#e879a0" opacity=".7"/>
          </svg>
          <div>
            <p style={{fontFamily:"'Montserrat',system-ui",fontSize:26,fontWeight:700,background:"linear-gradient(135deg,#e879a0,#8b5cf6,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.1}}>Your canvas awaits</p>
          </div>
          <svg width={22} height={22} viewBox="0 0 24 24" opacity=".5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#fde68a"/></svg>
        </div>
        <p style={{fontSize:13,color:"var(--text2)",fontFamily:"'Poppins',system-ui",marginBottom:4}}>Select a tool above and start drawing</p>
        <p style={{fontSize:11,color:"var(--text2)",opacity:.6,fontFamily:"'Poppins',system-ui"}}>Click to dismiss ✨</p>
      </div>
    </div>
  );
};
