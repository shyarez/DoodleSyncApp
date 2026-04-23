import { 
  FiMousePointer, FiPenTool, FiEdit2, FiSquare, FiCircle, 
  FiMinus, FiArrowUpRight, FiFileText, FiDelete, FiHexagon, 
  FiChevronDown, FiSun, FiMoon, FiZoomIn, FiZoomOut, FiRotateCcw, 
  FiRotateCw, FiImage, FiUsers, FiLink, FiAward, FiGrid, FiWifi, 
  FiCopy, FiLogOut, FiRefreshCw
} from "react-icons/fi";
import { LuHand } from "react-icons/lu";

export const SelectIcon = () => <FiMousePointer size={15} />;
export const HandIcon = () => <LuHand size={15} />;
export const PenIcon = () => <FiPenTool size={15} />;
export const PencilSketchIcon = () => <FiEdit2 size={15} />;
export const RectIcon = () => <FiSquare size={15} />;
export const EllipseIcon = () => <FiCircle size={15} />;
export const LineIcon = () => <FiMinus size={15} />;
export const ArrowIcon = () => <FiArrowUpRight size={15} />;
export const StickyIcon = () => <FiFileText size={15} />;
export const EraserIcon = () => <FiDelete size={15} />;
export const ShapeIcon = () => <FiHexagon size={15} />;
export const ChevronDown = () => <FiChevronDown size={14} />;
export const SunIcon = () => <FiSun size={14} />;
export const MoonIcon = () => <FiMoon size={14} />;
export const ZoomInIcon = () => <FiZoomIn size={14} />;
export const ZoomOutIcon = () => <FiZoomOut size={14} />;
export const UndoIcon = () => <FiRotateCcw size={14} />;
export const RedoIcon = () => <FiRotateCw size={14} />;
export const BgIcon = () => <FiImage size={14} />;

// --- Collaboration icons ---
export const UsersIcon = () => <FiUsers size={14} />;
export const LinkIcon = () => <FiLink size={14} />;
export const CrownIcon = () => <FiAward size={14} />;
export const GridIcon = () => <FiGrid size={14} />;
export const WifiIcon = () => <FiWifi size={14} />;
export const CopyIcon = () => <FiCopy size={14} />;
export const LogOutIcon = () => <FiLogOut size={14} />;
export const RefreshIcon = () => <FiRefreshCw size={14} />;

export const TOOL_ICONS = {
  select: <SelectIcon/>, hand: <HandIcon/>, pen: <PenIcon/>,
  pencil: <PencilSketchIcon/>, shape: <ShapeIcon/>,
  sticky: <StickyIcon/>, eraser: <EraserIcon/>,
  rect: <RectIcon/>, ellipse: <EllipseIcon/>, line: <LineIcon/>, arrow: <ArrowIcon/>,
};
