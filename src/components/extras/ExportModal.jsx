import { useState, useEffect, useRef } from "react";

export const ExportModal = ({ canvasRef, onClose }) => {
  const [fmt, setFmt] = useState("png");
  const [quality, setQuality] = useState(95);
  const [bg, setBg] = useState("transparent");
  const [preview, setPreview] = useState(null);
  const prevCanvas = useRef();

  useEffect(() => {
    const src = canvasRef.current;
    if (!src) return;
    const tmp = document.createElement("canvas");
    tmp.width = src.width; tmp.height = src.height;
    const ctx = tmp.getContext("2d");
    let actualBg = bg;
    if (fmt === "jpg" && bg === "transparent") actualBg = "white";
    
    if (actualBg !== "transparent" || fmt === "jpg") {
      ctx.fillStyle = actualBg === "white" ? "#ffffff" : "#1a1a2e";
      if (fmt === "jpg" && bg === "transparent") ctx.fillStyle = "#ffffff"; // extra safety
      ctx.fillRect(0, 0, tmp.width, tmp.height);
    }
    ctx.drawImage(src, 0, 0);
    setPreview(tmp.toDataURL(fmt === "jpg" ? "image/jpeg" : "image/png", quality / 100));
    prevCanvas.current = tmp;
  }, [canvasRef, fmt, quality, bg]);

  const doExport = () => {
    if (!prevCanvas.current) return;
    const link = document.createElement("a");
    link.download = `doodlesync-canvas.${fmt}`;
    link.href = prevCanvas.current.toDataURL(fmt === "jpg" ? "image/jpeg" : "image/png", quality / 100);
    link.click();
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.35)",backdropFilter:"blur(5px)" }}/>
      <div className="pop-in" style={{
          position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:201,
          background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:20,
          padding:"24px 26px",width:400,boxShadow:"0 12px 50px var(--shadow)",
          fontFamily:"'Poppins',system-ui",
      }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <p style={{fontSize:16,fontWeight:700,color:"var(--text)"}}>Export Canvas</p>
          <button onClick={onClose} style={{border:"none",background:"rgba(139,92,246,0.1)",borderRadius:7,width:28,height:28,cursor:"pointer",color:"var(--text2)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        {/* Preview */}
        <div style={{borderRadius:12,overflow:"hidden",marginBottom:16,border:"1px solid var(--border)",background:"repeating-conic-gradient(#e0d9f0 0% 25%,transparent 0% 50%) 0 0/16px 16px",height:160,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {preview && <img src={preview} alt="preview" style={{maxWidth:"100%",maxHeight:160,objectFit:"contain"}}/>}
        </div>

        {/* Format */}
        <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:7}}>Format</p>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["png","PNG (lossless)"],["jpg","JPEG (smaller)"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setFmt(id)} style={{flex:1,padding:"8px",borderRadius:10,border:`1.5px solid ${fmt===id?"var(--accent)":"var(--border)"}`,background:fmt===id?"rgba(139,92,246,0.1)":"transparent",cursor:"pointer",fontSize:12,fontWeight:600,color:fmt===id?"var(--accent)":"var(--text2)",transition:"all 0.14s"}}>{lbl}</button>
          ))}
        </div>

        {/* Background */}
        <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:7}}>Background</p>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["transparent","Transparent"],["white","White"],["dark","Dark"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setBg(id)} style={{flex:1,padding:"7px",borderRadius:10,border:`1.5px solid ${bg===id?"var(--accent)":"var(--border)"}`,background:bg===id?"rgba(139,92,246,0.1)":"transparent",cursor:"pointer",fontSize:11,fontWeight:600,color:bg===id?"var(--accent)":"var(--text2)",transition:"all 0.14s",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <div style={{width:12,height:12,borderRadius:3,background:id==="white"?"#fff":id==="dark"?"#1a1a2e":"transparent",border:"1.5px solid rgba(0,0,0,0.2)",backgroundImage:id==="transparent"?"repeating-conic-gradient(#ccc 0% 25%,white 0% 50%) 0 0/8px 8px":""}}/>
              {lbl}
            </button>
          ))}
        </div>
        
        {fmt === "jpg" && bg === "transparent" && (
          <div style={{padding:"6px",borderRadius:6,background:"rgba(239,68,68,0.1)",color:"#ef4444",fontSize:10,fontWeight:600,textAlign:"center",marginBottom:14,marginTop:-8}}>
            White background applied (JPEG doesn't support transparency)
          </div>
        )}

        {/* Quality (JPEG only) */}
        {fmt === "jpg" && (
          <>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text2)",marginBottom:7}}>Quality</p>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <input type="range" min={50} max={100} value={quality} onChange={e=>setQuality(+e.target.value)} style={{flex:1}}/>
              <span style={{fontSize:11,fontWeight:600,color:"var(--text2)",minWidth:36}}>{quality}%</span>
            </div>
          </>
        )}

        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,padding:"10px",borderRadius:11,border:"1px solid var(--border)",background:"transparent",fontSize:12,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Cancel</button>
          <button onClick={doExport} style={{flex:2,padding:"10px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#8b5cf6,#e879a0)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 14px rgba(139,92,246,0.4)"}}>
            ⬇ Download {fmt.toUpperCase()}
          </button>
        </div>
      </div>
    </>
  );
};
