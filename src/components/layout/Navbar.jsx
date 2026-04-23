import { useState } from "react";
import { Avatar } from "../ui/Avatar.jsx";
import { SunIcon, MoonIcon, RefreshIcon } from "../../icons/index.jsx";
import { NavBtn } from "./NavBtn.jsx";

export const Navbar = ({ socket, onHamburger, onExportOpen, onClearRequest, onForceSync, dark, setDark }) => {
  const { connected, roomId, users, error } = socket;

  // Determine connection status color
  let statusColor = "#a1a1aa"; // gray (disconnected / solo)
  if (connected && roomId) statusColor = "#4ade80"; // green (in room)
  else if (connected && !roomId) statusColor = "#3b82f6"; // blue (connected to server, not in room)
  if (error) statusColor = "#ef4444"; // red (error)

  const [syncing, setSyncing] = useState(false);
  const handleForceSync = () => {
    setSyncing(true);
    onForceSync();
    setTimeout(() => setSyncing(false), 800);
  };

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
          fontFamily:"var(--font-primary)",
          fontSize:22, fontWeight:400,
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
      {roomId && (
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:99,
            background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.18)",flexShrink:0}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:statusColor,boxShadow:`0 0 6px ${statusColor}`,animation:connected?"pulse 1.8s infinite":"none",flexShrink:0}}/>
          <span style={{fontSize:12,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-ui)",letterSpacing:1,textTransform:"uppercase"}}>{roomId}</span>
          <div style={{display:"flex",alignItems:"center"}}>{users.slice(0,3).map((m,i)=><Avatar key={m.userId} name={m.name} color={m.color} size={20} overlap idx={i}/>)}</div>
          <span style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--font-ui)"}}>({users.length})</span>
          
          <button onClick={handleForceSync} title="Force Resync"
            style={{ marginLeft: 4, display: "flex", alignItems: "center", justifyContent: "center", 
                     background: "none", border: "none", cursor: "pointer", color: "var(--accent)",
                     animation: syncing ? "spin 0.8s linear infinite" : "none" }}>
            <RefreshIcon />
          </button>
        </div>
      )}
      {!roomId && (
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:99,opacity:0.6}}>
           <span style={{width:6,height:6,borderRadius:"50%",background:statusColor,flexShrink:0}}/>
           <span style={{fontSize:11,fontWeight:500,color:"var(--text2)",fontFamily:"var(--font-ui)"}}>
             {connected ? "Solo Mode" : "Offline"}
           </span>
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
        <NavBtn label="Clear"  icon="⌫" danger onClick={onClearRequest}/>
      </div>
    </header>
  );
};
