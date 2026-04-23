import { useRef, useEffect } from "react";

export const SplitCanvas = (props) => {
  const secondaryCanvasRef = useRef(null);
  
  // Create a continuous copy loop so the secondary view literally mirrors the primary view's pixels
  useEffect(() => {
    let raf;
    const loop = () => {
      const pC = props.canvasRef?.current;
      const sC = secondaryCanvasRef.current;
      if (pC && sC) {
        if (sC.width !== pC.width || sC.height !== pC.height) {
           sC.width = pC.width;
           sC.height = pC.height;
        }
        const ctx = sC.getContext("2d", { willReadFrequently: true });
        ctx.clearRect(0,0,sC.width, sC.height);
        ctx.drawImage(pC, 0, 0);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [props.canvasRef]);

  return (
    <div style={{ flex: 1, position: "relative", background: props.canvasBg || "var(--canvas-bg)", overflow: "hidden", borderLeft: "2px solid var(--border)" }}>
      
      {/* Basic dot grid - scaled 1x */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:1,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse" x="0" y="0">
            <circle cx="13" cy="13" r="1" fill="var(--dot)" fillOpacity="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      <div style={{ position:"absolute", inset:0, transformOrigin:"0 0" }}>
        <canvas ref={secondaryCanvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "crosshair", zIndex: 2 }} />
      </div>
      
      {/* We also mirror the stickies visually on the right side */}
      <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
        <div style={{ transform: "scale(1) translate(0px, 0px)", transformOrigin: "0 0", width: "100%", height: "100%" }}>
          {props.stickies?.map(n => (
            <div key={n.id} style={{
              position: "absolute",
              left: n.x, top: n.y, width: n.w, height: n.h,
              background: n.color, borderRadius: 10,
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
              padding: "36px 12px 12px", transition: "transform 0.1s",
            }}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:28,background:"rgba(0,0,0,0.06)",borderTopLeftRadius:10,borderTopRightRadius:10}}/>
              <textarea readOnly value={n.text} style={{
                width: "100%", height: "100%", resize: "none", border: "none",
                background: "transparent", color: "#111", fontSize: 13,
                fontWeight: 500, fontFamily: "var(--font-ui)", outline: "none",
              }}/>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 20, right: 20, background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, fontFamily: "var(--font-ui)", zIndex: 10 }}>
        Mirrored Output
      </div>
    </div>
  );
};
