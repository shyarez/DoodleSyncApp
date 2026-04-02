import { useState } from "react";

export const NavBtn = ({ label, icon, accent, onClick, danger }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:99, cursor:"pointer",
        fontSize:11, fontWeight:600, fontFamily:"'Montserrat',system-ui",
        border: danger && !hov ? "1px solid rgba(248,113,113,0.3)" : "none",
        background: hov ? (danger?"rgba(254,202,202,0.85)":accent) : (danger?"rgba(254,226,226,0.3)":"rgba(139,92,246,0.08)"),
        color: hov ? (danger?"#dc2626":"white") : (danger?"#f87171":"var(--text2)"),
        boxShadow: hov && !danger ? `0 3px 12px ${accent}50` : "none",
        transform: hov ? "scale(1.03)" : "scale(1)",
      }}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
};
