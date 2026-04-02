export const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Montserrat:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { overflow: hidden; height: 100%; font-family: 'Montserrat', system-ui, sans-serif; }
    :root {
      --bg: #f8f6ff; --bg2: #f0ecfc; --surface: rgba(255,255,255,0.92);
      --border: rgba(180,160,220,0.25); --text: #2d2150; --text2: #6b5f8a;
      --accent: #8b5cf6; --accent2: #e879a0; --accent3: #38bdf8;
      --toolbar: rgba(255,255,255,0.96); --shadow: rgba(120,80,180,0.12);
      --dot: rgba(160,140,200,0.07);
      --canvas-bg: #ffffff;
    }
    .dark {
      --bg: #0d0d0d; --bg2: #1a1a1a; --surface: rgba(18,18,18,0.97);
      --border: rgba(80,80,90,0.35); --text: #e8e8e8; --text2: #888;
      --accent: #a78bfa; --accent2: #f472b6; --accent3: #38bdf8;
      --toolbar: rgba(14,14,14,0.98); --shadow: rgba(0,0,0,0.5);
      --dot: rgba(90,90,100,0.08);
      --canvas-bg: #111111;
    }
    * { transition: background-color 0.25s ease, border-color 0.25s ease, color 0.2s ease; }
    canvas, input[type=range], button { transition: none !important; }
    @keyframes floatUp { 0%,100%{transform:translateY(0) rotate(var(--rot,0deg));} 50%{transform:translateY(-18px) rotate(calc(var(--rot,0deg)+3deg));} }
    @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1) rotate(0deg);} 33%{transform:translate(28px,-38px) scale(1.05) rotate(4deg);} 66%{transform:translate(-18px,24px) scale(0.97) rotate(-2deg);} }
    @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1);} 45%{transform:translate(-36px,20px) scale(1.06);} 72%{transform:translate(18px,-28px) scale(0.98);} }
    @keyframes slideLeft  { from{opacity:0;transform:translateX(-24px);} to{opacity:1;transform:translateX(0);} }
    @keyframes fadeDown   { from{opacity:0;transform:translateY(-10px);} to{opacity:1;transform:translateY(0);} }
    @keyframes fadeUp     { from{opacity:0;transform:translateY(14px);}  to{opacity:1;transform:translateY(0);} }
    @keyframes popIn      { from{opacity:0;transform:scale(0.88);}       to{opacity:1;transform:scale(1);} }
    @keyframes pulse      { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.55);} 50%{box-shadow:0 0 0 6px rgba(74,222,128,0);} }
    @keyframes introBrushSlide { 0%{transform:translate(-100px,0) rotate(-35deg);opacity:0;} 15%{opacity:1;} 80%{opacity:1;} 100%{transform:translate(calc(100vw + 60px),0) rotate(-35deg);opacity:0;} }
    @keyframes introTextReveal { 0%{clip-path:inset(0 100% 0 0);opacity:0;} 10%{opacity:1;} 65%{clip-path:inset(0 0% 0 0);opacity:1;} 85%{clip-path:inset(0 0% 0 0);opacity:1;} 100%{clip-path:inset(0 0% 0 0);opacity:0;} }
    @keyframes introSubReveal  { 0%,35%{opacity:0;transform:translateY(12px);} 50%{opacity:1;transform:translateY(0);} 85%{opacity:1;} 100%{opacity:0;} }
    @keyframes introSkipFade   { 0%,25%{opacity:0;} 40%{opacity:1;} 85%{opacity:1;} 100%{opacity:0;} }
    @keyframes introWipe       { from{opacity:1;transform:scale(1);} to{opacity:0;transform:scale(1.05);} }
    @keyframes introBlobPulse  { 0%,100%{transform:scale(1) rotate(0deg);} 50%{transform:scale(1.1) rotate(8deg);} }
    @keyframes paintDrip       { 0%{height:0;opacity:0;} 25%{opacity:1;} 75%{height:48px;opacity:1;} 100%{height:48px;opacity:0;} }
    @keyframes bounce          { 0%,100%{transform:translateY(0);} 25%{transform:translateY(-14px);} 50%{transform:translateY(-6px);} 75%{transform:translateY(-10px);} }
    @keyframes floatBrush      { 0%,100%{transform:translateY(0) rotate(-15deg);} 50%{transform:translateY(-22px) rotate(-18deg);} }
    @keyframes floatStar       { 0%,100%{transform:translateY(0) rotate(0deg) scale(1);} 50%{transform:translateY(-16px) rotate(180deg) scale(1.2);} }
    @keyframes spinEmoji       { 0%{transform:rotate(0deg) scale(1);} 50%{transform:rotate(20deg) scale(1.15);} 100%{transform:rotate(0deg) scale(1);} }
    @keyframes paintSplat      { 0%{transform:scale(0) rotate(-30deg);opacity:0;} 30%{transform:scale(1.3) rotate(5deg);opacity:1;} 60%{transform:scale(0.9) rotate(-5deg);opacity:1;} 80%{opacity:1;} 100%{opacity:0;} }
    .slide-left { animation: slideLeft 0.22s cubic-bezier(.16,1,.3,1) both; }
    .fade-down  { animation: fadeDown  0.16s cubic-bezier(.16,1,.3,1) both; }
    .fade-up    { animation: fadeUp    0.4s  cubic-bezier(.16,1,.3,1) both; }
    .pop-in     { animation: popIn     0.18s cubic-bezier(.16,1,.3,1) both; }
    input[type=range] { -webkit-appearance:none; appearance:none; height:4px; border-radius:4px; outline:none; cursor:pointer; background:var(--border); }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:14px; height:14px; border-radius:50%; background:var(--accent); cursor:pointer; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.2); }
    ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
    [contenteditable]:focus { outline:none; }
  `}</style>
);
