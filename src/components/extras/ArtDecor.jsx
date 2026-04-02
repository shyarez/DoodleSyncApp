export const ArtDecor = ({ dark }) => {
  const brushColor = dark ? "rgba(167,139,250,0.18)" : "rgba(233,121,160,0.18)";
  const blobA = dark ? "#312e5a" : "#fce4ec";
  const blobB = dark ? "#1e1a38" : "#ede9fe";
  const blobC = dark ? "#182038" : "#e0f2fe";
  return (
    <div aria-hidden style={{position:"fixed",inset:0,overflow:"hidden",zIndex:0,pointerEvents:"none"}}>
      <div style={{position:"absolute",width:460,height:460,borderRadius:"62% 38% 68% 32%/52% 62% 38% 48%",background:`radial-gradient(circle,${blobA} 0%,transparent 70%)`,top:-90,left:-110,opacity:.7,animation:"blob1 22s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:340,height:340,borderRadius:"38% 62% 32% 68%/62% 38% 62% 38%",background:`radial-gradient(circle,${blobB} 0%,transparent 70%)`,bottom:30,right:-70,opacity:.6,animation:"blob2 28s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:250,height:250,borderRadius:"72% 28% 52% 48%/32% 68% 32% 68%",background:`radial-gradient(circle,${blobC} 0%,transparent 70%)`,top:"40%",left:"42%",opacity:.4,animation:"blob1 34s ease-in-out infinite"}}/>
      {[{x:"5%",y:"15%",r:-28,op:.13},{x:"87%",y:"70%",r:22,op:.11},{x:"2%",y:"62%",r:12,op:.1}].map((b,i)=>(
        <svg key={i} style={{position:"absolute",left:b.x,top:b.y,width:36,height:96,opacity:b.op,transform:`rotate(${b.r}deg)`,animation:`floatUp ${18+i*4}s ${i*3}s ease-in-out infinite`,"--rot":`${b.r}deg`}} viewBox="0 0 24 68">
          <rect x="10" y="0" width="4" height="36" rx="2" fill={brushColor.replace("0.18","0.9")}/>
          <ellipse cx="12" cy="43" rx="5" ry="7" fill={brushColor.replace("0.18","0.9")}/>
          <ellipse cx="12" cy="52" rx="3.5" ry="5" fill={brushColor.replace("0.18","0.7")}/>
          <ellipse cx="12" cy="59" rx="2" ry="3" fill={brushColor.replace("0.18","0.5")}/>
        </svg>
      ))}
      {[{x:"24%",y:"7%",c:"#fcd34d",s:16,op:.25,d:"3s"},{x:"71%",y:"14%",c:"#f9a8d4",s:13,op:.22,d:"7s"},{x:"54%",y:"93%",c:"#c4b5fd",s:15,op:.2,d:"5s"}].map((s,i)=>(
        <svg key={i} style={{position:"absolute",left:s.x,top:s.y,width:s.s,height:s.s,opacity:s.op,animation:`floatUp 16s ${s.d} ease-in-out infinite`}} viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={s.c}/>
        </svg>
      ))}
      {[{x:"41%",y:"3%",c:"#e879a0",s:8},{x:"7%",y:"43%",c:"#a78bfa",s:6},{x:"94%",y:"49%",c:"#38bdf8",s:10}].map((d,i)=>(
        <div key={i} style={{position:"absolute",left:d.x,top:d.y,width:d.s,height:d.s,borderRadius:"50%",background:d.c,opacity:.35,animation:`floatUp ${12+i*3}s ${i*4}s ease-in-out infinite`}}/>
      ))}
    </div>
  );
};
