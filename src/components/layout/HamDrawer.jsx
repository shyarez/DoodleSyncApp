import { useState } from "react";
import { Avatar } from "../ui/Avatar.jsx";
import { SunIcon, MoonIcon, UsersIcon, LinkIcon, CopyIcon, LogOutIcon, GridIcon, CrownIcon, WifiIcon } from "../../icons/index.jsx";

export const HamDrawer = ({ open, onClose, socket, onExport, onClear, dark, setDark }) => {
  const [tab, setTab] = useState("menu");
  const [joinCode, setJoinCode] = useState("");
  
  if (!open) return null;

  const { connected, roomId, users, isHost, mode, user, error, createRoom, joinRoom, leaveRoom, changeMode } = socket;

  const handleCreate = () => { createRoom(); };
  const handleJoin = () => { if (joinCode) joinRoom(joinCode); };
  const handleCopy = () => { if (roomId) navigator.clipboard.writeText(roomId); };

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.25)",backdropFilter:"blur(4px)"}}/>
      <div className="slide-left" style={{ position:"fixed",top:0,left:0,bottom:0,width:300,zIndex:101,
          background:"var(--toolbar)", borderRight:"1px solid var(--border)",
          boxShadow:"6px 0 40px var(--shadow)", display:"flex",flexDirection:"column",overflow:"hidden" }}>
        
        {/* Top */}
        <div style={{padding:"16px 18px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#e879a0,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M11.5 1.5a2.12 2.12 0 0 1 3 3L5 14H2v-3z"/></svg>
            </div>
            <span style={{fontFamily:"var(--font-primary)",fontSize:22,fontWeight:400,background:"linear-gradient(135deg,#e879a0,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"0px",paddingRight:4}}>DoodleSync</span>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(139,92,246,0.1)",borderRadius:7,width:27,height:27,cursor:"pointer",color:"var(--text2)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-ui)"}}>✕</button>
        </div>
        
        {/* Tabs */}
        <div style={{display:"flex",gap:4,padding:"10px 14px 0"}}>
          {[["menu","Menu"],["sessions","Session"],["account","Profile"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:"6px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"var(--font-ui)",
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
                {ic:"⬇",lbl:"Export image…",sh:"Ctrl+E",fn:()=>{onExport();onClose();}},
                {ic:"⌕",lbl:"Find on canvas",sh:"Ctrl+F"},
                {ic:"﹖",lbl:"Help",sh:"?"},
                {ic:"🗑",lbl:"Reset canvas",fn:()=>{onClear();onClose();},danger:true},
              ].map((item,i)=>(
                <button key={i} onClick={item.fn||null} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer",textAlign:"left",marginBottom:2}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:14,width:20}}>{item.ic}</span>
                  <span style={{flex:1,fontSize:12,fontWeight:500,color:item.danger?"#f87171":"var(--text)",fontFamily:"var(--font-ui)"}}>{item.lbl}</span>
                  {item.sh&&<span style={{fontSize:10,color:"var(--text2)",background:"var(--bg2)",padding:"2px 5px",borderRadius:4,fontFamily:"monospace"}}>{item.sh}</span>}
                </button>
              ))}
              <div style={{height:1,background:"var(--border)",margin:"10px 0"}}/>
              <div style={{padding:"4px 8px"}}>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:8,fontFamily:"var(--font-ui)"}}>Theme</p>
                <div style={{display:"flex",gap:5}}>
                  {[[<SunIcon key="sun"/>,"Light",false],[<MoonIcon key="moon"/>,"Dark",true]].map(([icon,lbl,val])=>(
                    <button key={lbl} onClick={()=>setDark(val)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"8px",borderRadius:9,border:`1px solid ${dark===val?"var(--accent)":"var(--border)"}`,background:dark===val?"rgba(139,92,246,0.1)":"transparent",cursor:"pointer",color:"var(--text2)",fontSize:11,fontWeight:600,fontFamily:"var(--font-ui)",transition:"all 0.15s"}}>
                      {icon} {lbl}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{height:1,background:"var(--border)",margin:"10px 0"}}/>
              {[["🐙","GitHub"],["𝕏","Follow us"],["💬","Discord"]].map(([ic,lbl])=>(
                <button key={lbl} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"7px 9px",borderRadius:10,border:"none",background:"transparent",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:14,width:20}}>{ic}</span><span style={{fontSize:12,color:"var(--text2)",fontFamily:"var(--font-ui)"}}>{lbl}</span>
                </button>
              ))}
            </div>
          )}
          
          {tab==="sessions" && (
            <div>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",margin:"4px 0 8px",fontFamily:"var(--font-ui)"}}>Collaboration</p>
              
              {!connected && (
                <div style={{padding:"12px",borderRadius:10,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",marginBottom:14,display:"flex",alignItems:"center",gap:8,color:"#ef4444"}}>
                  <WifiIcon />
                  <span style={{fontSize:12,fontWeight:600,fontFamily:"var(--font-ui)"}}>Reconnecting to server...</span>
                </div>
              )}

              {error && (
                <div style={{padding:"10px",borderRadius:8,background:"#fee2e2",color:"#b91c1c",fontSize:11,fontWeight:600,fontFamily:"var(--font-ui)",marginBottom:10}}>
                  {error}
                </div>
              )}

              {roomId ? (
                <>
                  <div style={{background:"rgba(139,92,246,0.08)",borderRadius:12,padding:"12px",marginBottom:14,border:"1px solid rgba(139,92,246,0.2)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <UsersIcon />
                        <span style={{fontSize:14,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-ui)",textTransform:"uppercase",letterSpacing:1}}>{roomId}</span>
                      </div>
                      <span style={{fontSize:9,fontWeight:700,background:"#4ade80",color:"white",padding:"3px 8px",borderRadius:99,display:"flex",alignItems:"center",gap:4,fontFamily:"var(--font-ui)"}}>
                        <span style={{width:4,height:4,borderRadius:"50%",background:"white",animation:"pulse 1.5s infinite"}}/> LIVE
                      </span>
                    </div>

                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                      {users.map((u) => (
                        <div key={u.userId} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 0"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <Avatar name={u.name} color={u.color} size={24} />
                            <span style={{fontSize:12,fontWeight:500,color:"var(--text)",fontFamily:"var(--font-ui)"}}>
                              {u.name} {u.userId === user.userId && "(You)"}
                            </span>
                          </div>
                          {isHost && u.userId !== user.userId && (
                            <LogOutIcon /> // Kick user could go here
                          )}
                          {!isHost && users.find(x => x.userId === u.userId && socket.hostId === u.userId) && (
                            <CrownIcon />
                          )}
                        </div>
                      ))}
                    </div>

                    {isHost && (
                      <div style={{marginTop:12,paddingTop:12,borderTop:"1px dashed var(--border)"}}>
                        <p style={{fontSize:10,fontWeight:600,color:"var(--text2)",marginBottom:6,fontFamily:"var(--font-ui)"}}>CANVAS MODE</p>
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>changeMode("shared")} style={{flex:1,padding:"6px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,fontFamily:"var(--font-ui)",background:mode==="shared"?"var(--accent)":"var(--bg2)",color:mode==="shared"?"white":"var(--text2)",cursor:"pointer"}}>Shared</button>
                          <button onClick={()=>changeMode("split")} disabled={users.length < 2} style={{flex:1,padding:"6px",borderRadius:6,border:"none",fontSize:11,fontWeight:600,fontFamily:"var(--font-ui)",background:mode==="split"?"var(--accent)":"var(--bg2)",color:mode==="split"?"white":"var(--text2)",cursor:users.length>1?"pointer":"not-allowed",opacity:users.length>1?1:0.5}}>Split ({users.length > 1 ? users.length : 'min 2'})</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{display:"flex",gap:6,marginBottom:14}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 10px",borderRadius:8,border:"1px solid var(--border)",background:"var(--bg2)"}}>
                      <LinkIcon />
                      <span style={{fontSize:12,color:"var(--text)",fontFamily:"var(--font-ui)",fontWeight:500,userSelect:"all"}}>{roomId}</span>
                    </div>
                    <button onClick={handleCopy} style={{padding:"0 12px",borderRadius:8,background:"var(--toolbar)",border:"1px solid var(--border)",color:"var(--text)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} title="Copy Code">
                      <CopyIcon />
                    </button>
                  </div>

                  <button onClick={leaveRoom} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid rgba(239,68,68,0.3)",background:"rgba(239,68,68,0.1)",color:"#ef4444",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"var(--font-ui)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <LogOutIcon /> Leave Room
                  </button>
                </>
              ) : (
                <>
                  {/* Create / Join UI */}
                  <button onClick={handleCreate} disabled={!connected} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",background:"linear-gradient(135deg,var(--accent),#38bdf8)",color:"white",fontWeight:600,fontSize:13,cursor:connected?"pointer":"not-allowed",fontFamily:"var(--font-ui)",boxShadow:"0 4px 12px rgba(139,92,246,0.3)",marginBottom:16,opacity:connected?1:0.7,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <UsersIcon /> Create New Room
                  </button>

                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{flex:1,height:1,background:"var(--border)"}}/>
                    <span style={{fontSize:10,fontWeight:600,color:"var(--text2)",fontFamily:"var(--font-ui)",textTransform:"uppercase"}}>OR</span>
                    <div style={{flex:1,height:1,background:"var(--border)"}}/>
                  </div>

                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <p style={{fontSize:11,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-ui)"}}>Join Room Code</p>
                    <div style={{display:"flex",gap:6}}>
                      <input 
                        value={joinCode} onChange={(e)=>setJoinCode(e.target.value.toLowerCase())}
                        placeholder="e.g. x7k2p" 
                        disabled={!connected}
                        style={{flex:1,padding:"10px 12px",borderRadius:8,border:"1px solid var(--border)",background:"var(--bg2)",fontSize:13,color:"var(--text)",fontFamily:"var(--font-ui)",outline:"none",fontWeight:600,letterSpacing:1}}
                        onKeyDown={e => e.key === 'Enter' && handleJoin()}
                      />
                      <button onClick={handleJoin} disabled={!connected || !joinCode} style={{padding:"0 16px",borderRadius:8,background:"var(--toolbar)",border:"1px solid var(--border)",color:joinCode?"var(--accent)":"var(--text2)",fontWeight:600,fontSize:12,cursor:joinCode?"pointer":"not-allowed",fontFamily:"var(--font-ui)",transition:"all 0.15s"}}>
                        Join
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {tab==="account" && (
            <div>
              <div style={{background:"rgba(139,92,246,0.08)",borderRadius:14,padding:"16px",marginBottom:14,textAlign:"center",border:"1px solid rgba(139,92,246,0.15)"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:user.color,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:21,color:"white",fontWeight:700,boxShadow:"0 4px 14px rgba(139,92,246,0.35)",fontFamily:"var(--font-ui)"}}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p style={{fontSize:14,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-ui)",marginBottom:2}}>{user.name}</p>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:8,background:"rgba(74,222,128,0.15)",borderRadius:99,padding:"3px 9px"}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:connected?"#4ade80":"#a1a1aa"}}/>
                  <span style={{fontSize:10,color:connected?"#16a34a":"var(--text2)",fontWeight:600,fontFamily:"var(--font-ui)"}}>{connected?"Online":"Offline"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
