import { useState } from "react";

export const Btn = ({ onClick, children, style={}, title, active=false, danger=false }) => {
  const [hov, setHov] = useState(false);
  return (
    <button title={title} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, border:"none", cursor:"pointer", borderRadius:9, padding:"6px 11px", fontFamily:"'Poppins',system-ui", fontWeight:600, fontSize:12, transition:"background 0.15s, transform 0.12s, box-shadow 0.15s",
        background: danger ? (hov?"rgba(248,113,113,0.18)":"transparent") : active ? "var(--accent)" : hov ? "rgba(139,92,246,0.12)" : "transparent",
        color: danger ? "#f87171" : active ? "white" : "var(--text2)",
        boxShadow: active ? "0 2px 10px rgba(139,92,246,0.35)" : "none",
        transform: hov && !active ? "scale(1.03)" : "scale(1)", ...style }}>
      {children}
    </button>
  );
};
