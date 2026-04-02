import { useState } from "react";
import { Avatar } from "../ui/Avatar.jsx";
import { SunIcon, MoonIcon } from "../../icons/index.jsx";

export const HamDrawer = ({ open, onClose, sessions, currentSession, setCurrentSession, onExport, onClear, dark, setDark }) => {
  const [tab, setTab] = useState("menu");
  if (!open) return null;
  const sess = sessions.find(s=>s.id===currentSession);

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)"}}/>
      <div className="slide-left" style={{ position:"fixed",top:0,left:0,bottom:0,width:296,zIndex:101,
          background:"var(--toolbar)", borderRight:"1px solid var(--border)",
          boxShadow:"6px 0 40px var(--shadow)", display:"flex",flexDirection:"column",overflow:"hidden" }}>
        {/* Top */}
        <div style={{padding:"16px 18px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#e879a0,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M11.5 1.5a2.12 2.12 0 0 1 3 3L5 14H2v-3z"/></svg>
            </div>
            <span style={{fontFamily:"'Architects Daughter',cursive",fontSize:19,fontWeight:400,background:"linear-gradient(135deg,#e879a0,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"0px",paddingRight:4}}>DoodleSync</span>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(139,92,246,0.1)",borderRadius:7,width:27,height:27,cursor:"pointer",color:"var(--text2)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Montserrat',system-ui"}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:4,padding:"10px 14px 0"}}>
          {[["menu","Menu"],["sessions","Sessions"],["account","Account"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:"6px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Montserrat',system-ui",
                background:tab===id?"var(--accent)":"transparent", color:tab===id?"white":"var(--text2)", transition:"all 0.15s" }}>{lbl}</button>
          ))}
        </div>
        {/* Body */}
        <div style={{flex:1,overflowY:"auto",padding:"10px 12px 20px"}}>
          {tab==="menu" && (
            <div>
              {[
                {ic:"🗁",lbl:"Open file",sh:"Ctrl+O"},
                {ic:"⎙",lbl:"Save to…",sh:"Ctrl+S"},
                {ic:"￫]",lbl:"Export image…",sh:"Ctrl+E",fn:()=>{onExport();onClose();}},
                {ic:"ጸ",lbl:"Live collaboration…"},
                {ic:"⌕",lbl:"Find on canvas",sh:"Ctrl+F"},
                {ic:"﹖",lbl:"Help",sh:"?"},
                {ic:"🗑",lbl:"Reset canvas",fn:()=>{onClear();onClose();},danger:true},
              ].map((item,i)=>(
                <button key={i} onClick={item.fn||null} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",textAlign:"left",marginBottom:2}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:14,width:20}}>{item.ic}</span>
                  <span style={{flex:1,fontSize:12,fontWeight:500,color:item.danger?"#f87171":"var(--text)",fontFamily:"'Montserrat',system-ui"}}>{item.lbl}</span>
                  {item.sh&&<span style={{fontSize:10,color:"var(--text2)",background:"var(--bg2)",padding:"2px 5px",borderRadius:4,fontFamily:"monospace"}}>{item.sh}</span>}
                </button>
              ))}
              <div style={{height:1,background:"var(--border)",margin:"10px 0"}}/>
              <div style={{padding:"4px 8px"}}>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Montserrat',system-ui"}}>Theme</p>
                <div style={{display:"flex",gap:5}}>
                  {[[<SunIcon/>,"Light",false],[<MoonIcon/>,"Dark",true]].map(([icon,lbl,val])=>(
                    <button key={lbl} onClick={()=>setDark(val)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"8px",borderRadius:9,border:`1px solid ${dark===val?"var(--accent)":"var(--border)"}`,background:dark===val?"rgba(139,92,246,0.1)":"transparent",cursor:"pointer",color:"var(--text2)",fontSize:11,fontWeight:600,fontFamily:"'Montserrat',system-ui",transition:"all 0.15s"}}>
                      {icon} {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{height:1,background:"var(--border)",margin:"10px 0"}}/>
              {[["🐙","GitHub"],["𝕏","Follow us"],["💬","Discord"]].map(([ic,lbl])=>(
                <button key={lbl} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"7px 9px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:14,width:20}}>{ic}</span><span style={{fontSize:12,color:"var(--text2)",fontFamily:"'Montserrat',system-ui"}}>{lbl}</span>
                </button>
              ))}
            </div>
          )}
          {tab==="sessions" && (
            <div>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",margin:"4px 0 8px",fontFamily:"'Montserrat',system-ui"}}>Active Session</p>
              {sess && (
                <div style={{background:"rgba(139,92,246,0.08)",borderRadius:12,padding:"10px 12px",marginBottom:14,border:"1px solid rgba(139,92,246,0.2)"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--text)",fontFamily:"'Montserrat',system-ui"}}>{sess.name}</span>
                    <span style={{fontSize:9,fontWeight:700,background:"#4ade80",color:"white",padding:"2px 7px",borderRadius:99,display:"flex",alignItems:"center",gap:3}}>● LIVE</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex"}}>{sess.members.map((m,i)=><Avatar key={i} name={m.name} color={m.c} size={22} overlap idx={i}/>)}</div>
                    <span style={{fontSize:11,color:"var(--text2)",fontFamily:"'Montserrat',system-ui"}}>{sess.members.length} members</span>
                  </div>
                </div>
              )}
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Montserrat',system-ui"}}>All Sessions</p>
              {sessions.map(s=>(
                <div key={s.id} onClick={()=>setCurrentSession(s.id)} style={{padding:"9px 12px",borderRadius:11,marginBottom:5,cursor:"pointer",background:currentSession===s.id?"rgba(139,92,246,0.1)":"transparent",border:`1px solid ${currentSession===s.id?"rgba(139,92,246,0.3)":"transparent"}`,transition:"all 0.14s"}} onMouseEnter={e=>{if(currentSession!==s.id)e.currentTarget.style.background="rgba(139,92,246,0.05)"}} onMouseLeave={e=>{if(currentSession!==s.id)e.currentTarget.style.background="transparent"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:500,color:"var(--text)",fontFamily:"'Montserrat',system-ui"}}>{s.name}</span>
                    {currentSession===s.id&&<span style={{fontSize:10,color:"var(--accent)",fontWeight:600}}>✓</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {s.members.map((m,i)=><Avatar key={i} name={m.name} color={m.c} size={17} overlap idx={i}/>)}
                    <span style={{fontSize:10,color:"var(--text2)",marginLeft:4,fontFamily:"'Montserrat',system-ui"}}>{s.members.length} members</span>
                  </div>
                </div>
              ))}
              <button style={{width:"100%",marginTop:8,padding:"9px",borderRadius:10,border:"1.5px dashed rgba(139,92,246,0.4)",background:"transparent",cursor:"pointer",fontSize:12,color:"var(--accent)",fontWeight:600,fontFamily:"'Montserrat',system-ui"}}>+ New Session</button>
              <div style={{height:1,background:"var(--border)",margin:"14px 0 10px"}}/>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"'Montserrat',system-ui"}}>Invite Link</p>
              <div style={{display:"flex",gap:6}}>
                <input readOnly value="doodlesync.app/r/x7k2p" style={{flex:1,padding:"7px 9px",borderRadius:8,border:"1px solid var(--border)",background:"var(--bg2)",fontSize:11,color:"var(--text2)",fontFamily:"monospace",outline:"none"}}/>
                <button style={{padding:"7px 11px",borderRadius:8,border:"none",background:"var(--accent)",color:"white",fontWeight:600,fontSize:11,cursor:"pointer",fontFamily:"'Montserrat',system-ui"}}>Copy</button>
              </div>
            </div>
          )}
          {tab==="account" && (
            <div>
              <div style={{background:"rgba(139,92,246,0.08)",borderRadius:14,padding:"16px",marginBottom:14,textAlign:"center",border:"1px solid rgba(139,92,246,0.15)"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#e879a0,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:21,color:"white",fontWeight:700,boxShadow:"0 4px 14px rgba(139,92,246,0.35)"}}>S</div>
                <p style={{fontSize:14,fontWeight:600,color:"var(--text)",fontFamily:"'Montserrat',system-ui",marginBottom:2}}>Shreya</p>
                <p style={{fontSize:11,color:"var(--text2)",fontFamily:"'Montserrat',system-ui"}}>shreya@example.com</p>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:8,background:"rgba(74,222,128,0.15)",borderRadius:99,padding:"3px 9px"}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:"#4ade80"}}/>
                  <span style={{fontSize:10,color:"#16a34a",fontWeight:600,fontFamily:"'Montserrat',system-ui"}}>Online</span>
                </div>
              </div>
              {[["Edit Profile","rgba(139,92,246,0.12)","var(--accent)"],["Preferences","var(--bg2)","var(--text2)"],["DoodleSync+ Upgrade","linear-gradient(135deg,#f9a8d4,#a78bfa)","white"]].map(([lbl,bg,color])=>(
                <button key={lbl} style={{width:"100%",padding:"10px",borderRadius:11,border:"none",background:bg,color,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:7,fontFamily:"'Montserrat',system-ui",textAlign:"center"}}>{lbl}</button>
              ))}
              <div style={{height:1,background:"var(--border)",margin:"8px 0 10px"}}/>
              <button style={{width:"100%",padding:"10px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#6366f1,#4f46e5)",color:"white",fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:7,fontFamily:"'Montserrat',system-ui"}}>Sign in with Google</button>
              <button style={{width:"100%",padding:"10px",borderRadius:11,border:"1px solid rgba(248,113,113,0.3)",background:"rgba(254,202,202,0.12)",color:"#f87171",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Montserrat',system-ui"}}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
