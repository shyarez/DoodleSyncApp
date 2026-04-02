import { VIVID_PALETTE, PASTEL_PALETTE } from "../../data/constants.js";

export const ColorPicker = ({ color, setColor, paletteMode, setPaletteMode }) => {
  const palette = paletteMode === "pastel" ? PASTEL_PALETTE : VIVID_PALETTE;
  return (
    <div className="fade-down" style={{ position:"absolute",top:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",
        background:"var(--toolbar)",border:"1px solid var(--border)",borderRadius:16,padding:"12px 13px",width:206,
        boxShadow:"0 8px 32px var(--shadow)",zIndex:500 }}>
      <div style={{display:"flex",gap:4,marginBottom:10,background:"var(--bg2)",borderRadius:9,padding:3}}>
        {["vivid","pastel"].map(m=>(
          <button key={m} onClick={()=>setPaletteMode(m)} style={{flex:1,padding:"5px",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,background:paletteMode===m?"var(--toolbar)":"transparent",color:paletteMode===m?"var(--accent)":"var(--text2)",boxShadow:paletteMode===m?"0 1px 4px rgba(0,0,0,0.1)":"none",transition:"all 0.14s",fontFamily:"'Poppins',system-ui",textTransform:"capitalize"}}>
            {m==="vivid"?"🎨 Vivid":"🌸 Pastel"}
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:10}}>
        {palette.map(c=>(
          <button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:7,border:`${color===c?"3px solid var(--accent)":"2px solid rgba(0,0,0,0.07)"}`,background:c,cursor:"pointer",transform:color===c?"scale(1.15)":"scale(1)",transition:"all 0.1s",boxShadow:color===c?"0 0 0 2px white,0 0 0 4px rgba(139,92,246,0.4)":"none"}}/>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:7,paddingTop:8,borderTop:"1px solid var(--border)"}}>
        <div style={{width:22,height:22,borderRadius:6,background:color,border:"1.5px solid rgba(0,0,0,0.1)",flexShrink:0}}/>
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:24,height:24,border:"none",background:"none",cursor:"pointer",padding:0}}/>
        <span style={{fontSize:10,color:"var(--text2)",fontFamily:"monospace"}}>{color}</span>
      </div>
    </div>
  );
};
