import { useState, useEffect, useRef } from "react";

export const IntroScreen = ({ onDone }) => {
  const [phase, setPhase] = useState("in");
  const canvasRef = useRef();
  const rafRef = useRef();

  // Animated brush stroke via canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
    const ctx = canvas.getContext("2d");
    const CX = canvas.width / 2, CY = canvas.height / 2;
    const startX = CX - 280, endX = CX + 280;
    let progress = 0;
    const grad = ctx.createLinearGradient(startX, CY, endX, CY);
    grad.addColorStop(0, "#e879a0");
    grad.addColorStop(0.45, "#8b5cf6");
    grad.addColorStop(1, "#38bdf8");

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cur = startX + (endX - startX) * Math.min(progress, 1);
      ctx.save();
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = 28; ctx.strokeStyle = grad; ctx.globalAlpha = 0.12;
      ctx.beginPath(); ctx.moveTo(startX, CY + 32);
      ctx.bezierCurveTo(startX + 90, CY + 8, CX + 10, CY + 38, cur, CY + 18);
      ctx.stroke();
      ctx.lineWidth = 8; ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.moveTo(startX, CY + 22);
      ctx.bezierCurveTo(startX + 70, CY + 4, CX - 10, CY + 30, cur, CY + 12);
      ctx.stroke();
      ctx.restore();
      if (progress < 1) {
        ctx.save();
        const tipGrad = ctx.createRadialGradient(cur, CY + 18, 0, cur, CY + 18, 16);
        tipGrad.addColorStop(0, "rgba(232,121,160,0.95)");
        tipGrad.addColorStop(1, "rgba(139,92,246,0)");
        ctx.beginPath(); ctx.arc(cur, CY + 18, 16, 0, Math.PI * 2);
        ctx.fillStyle = tipGrad; ctx.fill();
        ctx.restore();
      }
      progress += 0.009;
      if (progress < 1.05) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setPhase("out"); setTimeout(onDone, 650); }, 4200);
    return () => clearTimeout(t);
  }, [onDone]);

  const skip = () => { setPhase("out"); setTimeout(onDone, 650); };

  const floaters = [
    { el:"🎨", x:"8%",  y:"20%", delay:"0s",  dur:"3.2s", size:36, anim:"spinEmoji" },
    { el:"✨", x:"88%", y:"18%", delay:"0.4s", dur:"2.4s", size:28, anim:"floatStar" },
    { el:"⭐", x:"15%", y:"72%", delay:"0.8s", dur:"2.8s", size:22, anim:"floatStar" },
    { el:"😊", x:"80%", y:"68%", delay:"0.2s", dur:"3.5s", size:30, anim:"spinEmoji" },
    { el:"🖌️", x:"5%",  y:"45%", delay:"1.0s", dur:"4.0s", size:32, anim:"floatBrush" },
    { el:"🖌️", x:"91%", y:"50%", delay:"0.6s", dur:"3.8s", size:28, anim:"floatBrush" },
    { el:"💫", x:"50%", y:"10%", delay:"1.2s", dur:"2.6s", size:24, anim:"floatStar" },
    { el:"🎭", x:"72%", y:"82%", delay:"0.5s", dur:"3.0s", size:28, anim:"spinEmoji" },
    { el:"🌈", x:"28%", y:"85%", delay:"1.4s", dur:"3.4s", size:26, anim:"floatStar" },
  ];

  const splats = [
    { x:"18%", y:"30%", c:"#fde68a", size:18, delay:"0.3s" },
    { x:"78%", y:"35%", c:"#fca5a5", size:14, delay:"0.8s" },
    { x:"12%", y:"60%", c:"#bbf7d0", size:16, delay:"1.1s" },
    { x:"85%", y:"60%", c:"#bae6fd", size:20, delay:"0.5s" },
    { x:"42%", y:"78%", c:"#ddd6fe", size:15, delay:"1.3s" },
  ];

  const text = "Welcome to DoodleSync!";
  const chars = text.split("");

  return (
    <div style={{
        position:"fixed", inset:0, zIndex:999,
        background:"var(--bg)",
        display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
        animation: phase === "out" ? "introWipe 0.65s cubic-bezier(.4,0,.2,1) forwards" : "none",
        overflow:"hidden",
    }}>
      {/* Background blobs */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",width:520,height:520,borderRadius:"60% 40% 70% 30%/50% 60% 40% 50%",background:"radial-gradient(circle,#fce4ec 0%,transparent 68%)",top:-110,left:-130,opacity:.65,animation:"introBlobPulse 4.5s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:420,height:420,borderRadius:"40% 60% 30% 70%/60% 40% 60% 40%",background:"radial-gradient(circle,#ede9fe 0%,transparent 68%)",bottom:-90,right:-90,opacity:.58,animation:"introBlobPulse 5.5s 1s ease-in-out infinite"}}/>
        <div style={{position:"absolute",width:300,height:300,borderRadius:"70%",background:"radial-gradient(circle,#e0f2fe 0%,transparent 68%)",top:"38%",left:"40%",opacity:.38,animation:"introBlobPulse 7s 2.2s ease-in-out infinite"}}/>
      </div>

      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>

      {splats.map((s,i)=>(
        <div key={i} style={{position:"absolute",left:s.x,top:s.y,width:s.size,height:s.size,borderRadius:"50% 60% 40% 70%",background:s.c,pointerEvents:"none",opacity:0,animation:`paintSplat 4.2s ${s.delay} ease both`}}/>
      ))}

      {floaters.map((f,i)=>(
        <div key={i} style={{position:"absolute",left:f.x,top:f.y,fontSize:f.size,pointerEvents:"none",opacity:0,animation:`introSubReveal 4.2s ${f.delay} ease both`}}>
          <span style={{display:"inline-block",animation:`${f.anim} ${f.dur} ${f.delay} ease-in-out infinite`}}>{f.el}</span>
        </div>
      ))}

      {/* Travelling paintbrush */}
      <div style={{position:"absolute",top:"50%",left:0,transform:"translateY(-76px)",pointerEvents:"none",animation:"introBrushSlide 2.4s 0.15s cubic-bezier(.3,0,.2,1) both",opacity:0}}>
        <svg width={52} height={132} viewBox="0 0 24 68" style={{filter:"drop-shadow(0 4px 14px rgba(139,92,246,0.55))"}}>
          <rect x="10" y="0" width="4" height="36" rx="2" fill="#8b5cf6"/>
          <rect x="9" y="33" width="6" height="5" rx="1" fill="#6d28d9"/>
          <ellipse cx="12" cy="44" rx="6.5" ry="8.5" fill="#e879a0"/>
          <ellipse cx="12" cy="53" rx="4.5" ry="6.5" fill="#e879a0" opacity=".75"/>
          <ellipse cx="12" cy="60" rx="2.8" ry="4.2" fill="#e879a0" opacity=".5"/>
          <ellipse cx="12" cy="65" rx="1.6" ry="2.8" fill="#e879a0" opacity=".28"/>
        </svg>
        <div style={{width:4,height:0,background:"linear-gradient(#e879a0,rgba(232,121,160,0))",borderRadius:2,margin:"0 auto",animation:"paintDrip 2.2s 0.4s ease-in both"}}/>
      </div>

      {/* Main text */}
      <div style={{position:"relative",textAlign:"center",zIndex:2,padding:"0 20px"}}>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:0,marginBottom:4}}>
          {chars.map((ch, i) => (
            <span key={i} style={{
              display:"inline-block",
              fontFamily:"'Architects Daughter',cursive",
              fontSize:"clamp(28px,5.5vw,62px)",
              fontWeight:400,
              background:"linear-gradient(135deg,#e879a0 0%,#8b5cf6 50%,#38bdf8 100%)",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              whiteSpace: ch === " " ? "pre" : "normal",
              opacity: 0,
              animation: `introTextReveal 4.2s ${0.3 + i * 0.035}s cubic-bezier(.4,0,.2,1) both, bounce 0.8s ${0.3 + i * 0.035}s ease both`,
              filter:"drop-shadow(0 2px 6px rgba(139,92,246,0.25))",
            }}>{ch === " " ? "\u00A0" : ch}</span>
          ))}
        </div>
        <p style={{
          fontFamily:"'Montserrat',system-ui", fontSize:"clamp(12px,1.8vw,15px)", fontWeight:500,
          color:"var(--text2)", marginTop:8, letterSpacing:"0.04em",
          animation:"introSubReveal 4.2s 1.2s ease both", opacity:0,
        }}>
          Your collaborative canvas awaits ✨
        </p>
        <div style={{display:"flex",gap:9,justifyContent:"center",marginTop:18,animation:"introSubReveal 4.2s 1.5s ease both",opacity:0}}>
          {["#e879a0","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"].map((c,i)=>(
            <div key={i} style={{
              width:13, height:13, borderRadius:"50%", background:c,
              boxShadow:`0 2px 8px ${c}88`,
              animation:`floatUp ${1.8 + i*0.2}s ${i*0.1}s ease-in-out infinite`,
            }}/>
          ))}
        </div>
      </div>

      <button onClick={skip} style={{
          position:"absolute", bottom:24, right:24,
          border:"1px solid var(--border)", background:"rgba(139,92,246,0.08)",
          borderRadius:99, padding:"7px 16px", cursor:"pointer",
          fontSize:12, fontWeight:600, color:"var(--text2)",
          fontFamily:"'Montserrat',system-ui",
          animation:"introSkipFade 4.2s 0.3s ease both", opacity:0,
      }}>
        Skip →
      </button>
    </div>
  );
};
