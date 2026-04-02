import { Avatar } from "../ui/Avatar.jsx";
import { SunIcon, MoonIcon } from "../../icons/index.jsx";
import { NavBtn } from "./NavBtn.jsx";

export const Navbar = ({ currentSession, sessions, onHamburger, onExportOpen, onClearRequest, dark, setDark }) => {
  const sess = sessions.find(s => s.id === currentSession);
  return (
    <header style={{ position:"fixed", top:0, left:0, right:0, height:52, zIndex:70,
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px",
        background:"var(--toolbar)", borderBottom:"1px solid var(--border)",
        boxShadow:"0 1px 16px var(--shadow)" }}>
      {/* Left — hamburger + logo */}
      <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
        <button onClick={onHamburger}
          style={{width:34,height:34,borderRadius:9,border:"none",cursor:"pointer",background:"rgba(139,92,246,0.1)",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4.5,flexShrink:0}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.2)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"}>
          {[0,1,2].map(i=><span key={i} style={{display:"block",width:14,height:1.8,borderRadius:2,background:"var(--accent)"}}/>)}
        </button>
        <span style={{
          fontFamily:"'Architects Daughter',cursive",
          fontSize:20, fontWeight:400,
          background:"linear-gradient(135deg,#e879a0 0%,#8b5cf6 55%,#38bdf8 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          whiteSpace:"nowrap", userSelect:"none",
          paddingRight:6,
          display:"inline-block",
        }}>
          DoodleSync
        </span>
      </div>

      {/* Center — session pill */}
      {sess && (
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:99,
            background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.18)",flexShrink:0}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80",animation:"pulse 1.8s infinite",flexShrink:0}}/>
          <span style={{fontSize:12,fontWeight:600,color:"var(--text)",fontFamily:"'Montserrat',system-ui"}}>{sess.name}</span>
          <div style={{display:"flex",alignItems:"center"}}>{sess.members.slice(0,3).map((m,i)=><Avatar key={i} name={m.name} color={m.c} size={20} overlap idx={i}/>)}</div>
          <span style={{fontSize:11,color:"var(--text2)",fontFamily:"'Montserrat',system-ui"}}>({sess.members.length})</span>
        </div>
      )}

      {/* Right — action buttons */}
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <button onClick={()=>setDark(d=>!d)} title="Toggle dark mode"
          style={{width:32,height:32,borderRadius:9,border:"none",cursor:"pointer",background:"rgba(139,92,246,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text2)"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.2)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(139,92,246,0.1)"}>
          {dark ? <SunIcon/> : <MoonIcon/>}
        </button>
        <NavBtn label="Export" icon="⬇" accent="#8b5cf6" onClick={onExportOpen}/>
        <NavBtn label="Share"  icon="↗" accent="#e879a0" onClick={()=>navigator.clipboard?.writeText(window.location.href)}/>
        <NavBtn label="Clear"  icon="⌫" danger onClick={onClearRequest}/>
      </div>
    </header>
  );
};
