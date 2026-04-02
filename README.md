# DoodleSyncApp — Component Structure

This folder contains the **refactored** version of `DoodleSync.jsx`, split into modular, maintainable files.

## Usage

Import `App.jsx` into your React project as the root component:

```jsx
import DoodleSync from "./src/App.jsx";

function App() {
  return <DoodleSync />;
}
```

## Folder Structure

```
src/
├── App.jsx                          ← Root app (assembles everything)
│
├── data/
│   └── constants.js                 ← All constants & data arrays
│
├── icons/
│   └── index.jsx                    ← All SVG icon components + TOOL_ICONS map
│
├── components/
│   ├── ui/                          ← Reusable primitive UI
│   │   ├── Avatar.jsx
│   │   ├── Btn.jsx
│   │   └── Divider.jsx
│   │
│   ├── canvas/                      ← Drawing surface & canvas tools
│   │   ├── CanvasArea.jsx           ← Main drawing engine
│   │   ├── StickyNote.jsx           ← Draggable/resizable sticky notes
│   │   ├── EmptyState.jsx           ← Welcome placeholder
│   │   └── ZoomControls.jsx         ← Zoom in/out + undo/redo bar
│   │
│   ├── layout/                      ← Navigation & drawers
│   │   ├── Navbar.jsx
│   │   ├── NavBtn.jsx
│   │   └── HamDrawer.jsx            ← Hamburger side drawer
│   │
│   ├── toolbar/                     ← Tool selection & property menus
│   │   ├── Toolbar.jsx              ← Main toolbar (composes sub-menus)
│   │   ├── ColorPicker.jsx
│   │   ├── StrokeMenu.jsx
│   │   ├── EraserMenu.jsx
│   │   ├── ShapeDropdown.jsx
│   │   └── BgPicker.jsx
│   │
│   └── extras/                      ← Overlays & decorative components
│       ├── Fonts.jsx                ← Global CSS & @imports
│       ├── ArtDecor.jsx             ← Animated background blobs/brushes
│       ├── IntroScreen.jsx          ← Animated splash screen
│       ├── ExportModal.jsx          ← Export canvas as PNG/JPEG
│       └── ClearConfirm.jsx         ← "Clear canvas?" confirmation modal
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `H` | Pan / Hand |
| `P` | Pen |
| `K` | Pencil |
| `S` | Shape |
| `N` | Sticky note |
| `E` | Eraser |
| `R/O/L/A` | Rect / Ellipse / Line / Arrow |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+E` | Export |
