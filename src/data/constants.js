export const VIVID_PALETTE = ["#1e1b4b","#18181b","#374151","#dc2626","#ea580c","#ca8a04","#16a34a","#0284c7","#7c3aed","#db2777","#0f766e","#6b7280","#ffffff","#1d4ed8","#059669"];
export const PASTEL_PALETTE = ["#fca5a5","#fdba74","#fde68a","#bbf7d0","#bae6fd","#ddd6fe","#fbcfe8","#fecdd3","#d9f99d","#a5f3fc","#c7d2fe","#fef9c3","#ffe4e6","#dcfce7","#f0f9ff"];
export const STICKY_PRESETS = ["#fef08a","#fbcfe8","#bae6fd","#bbf7d0","#ddd6fe","#fdba74"];

export const SHAPES = [
  { id:"rect",    label:"Rectangle", key:"r" },
  { id:"ellipse", label:"Ellipse",   key:"o" },
  { id:"line",    label:"Line",      key:"l" },
  { id:"arrow",   label:"Arrow",     key:"a" },
];

export const ARROW_STYLES = [
  { id:"solid",  label:"Solid",  dash:[]         },
  { id:"dashed", label:"Dashed", dash:[12,6]      },
  { id:"dotted", label:"Dotted", dash:[3,6]       },
];

export const CANVAS_BG_LIGHT = [
  { id:"white",       label:"White",        color:"#ffffff"     },
  { id:"offwhite",    label:"Off-white",    color:"#faf9f7"     },
  { id:"pastelYellow",label:"Pastel Yellow",color:"#fffde7"     },
  { id:"pastelBlue",  label:"Pastel Blue",  color:"#e8f4fd"     },
];
export const CANVAS_BG_DARK = [
  { id:"black",       label:"Midnight",     color:"#0d0d0d"     },
  { id:"darkgray",    label:"Dark Gray",    color:"#1c1c1c"     },
  { id:"navy",        label:"Deep Navy",    color:"#0a0f1e"     },
];

export const TOOLS = [
  { id:"select",  label:"Select",     key:"v" },
  { id:"hand",    label:"Pan",        key:"h" },
  { id:"pen",     label:"Pen",        key:"p" },
  { id:"pencil",  label:"Pencil",     key:"k" },
  { id:"shape",   label:"Shape",      key:"s" },
  { id:"sticky",  label:"Sticky",     key:"n" },
  { id:"eraser",  label:"Eraser",     key:"e" },
];

export const ERASER_MODES = [
  { id:"freehand", label:"Freehand", desc:"Paint to erase" },
  { id:"lasso",    label:"Lasso",    desc:"Draw around area" },
  { id:"rect",     label:"Rect",     desc:"Drag a rectangle" },
];

export const SESSIONS = [
  { id:"s1", name:"Design Sprint #3",  members:[{name:"Shreya",c:"#e879a0"},{name:"Alex",c:"#a78bfa"},{name:"Jordan",c:"#38bdf8"}] },
  { id:"s2", name:"Wireframe Review",  members:[{name:"Mia",c:"#f97316"},{name:"Leo",c:"#10b981"}] },
  { id:"s3", name:"Brand Moodboard",   members:[{name:"Sam",c:"#ef4444"}] },
];

export const STICKY_CYCLE = ["#fef08a","#fbcfe8","#bae6fd","#bbf7d0","#ddd6fe","#fdba74"];
