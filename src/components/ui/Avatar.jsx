export const Avatar = ({ name, color, size = 26, overlap = false, idx = 0 }) => (
  <div title={name} style={{ width:size, height:size, borderRadius:"50%", background:color, border:"2.5px solid var(--surface)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.38, color:"white", fontWeight:700, boxShadow:"0 2px 6px rgba(0,0,0,0.18)", marginLeft:overlap&&idx>0 ? -size*.32 : 0, position:"relative", zIndex:10-idx, flexShrink:0 }}>
    {name[0].toUpperCase()}
  </div>
);
