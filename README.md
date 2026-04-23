# 🎨 DoodleSyncApp

A real-time collaborative drawing canvas with live multi-user syncing, sticky notes, and multi-tool sketching — built for smooth, shared creativity.

---

## 🚀 Features

- 👥 Real-time multi-user collaboration (Socket.IO)
- ✏️ Multiple drawing tools:
  - Pen
  - Pencil
  - Shapes (rect, ellipse, line, arrow)
  - Eraser (freehand / lasso / rectangle)
- 🗒️ Sticky notes with live sync (text, color, movement)
- ↩️ Undo / Redo support
- 🧹 Canvas clearing (user-scoped control)
- 🔄 Live stroke streaming
- 🎯 Zoom + Pan support
- 🧠 Optimized canvas rendering for smooth drawing
- 🎨 Custom stroke styles, opacity, fill support

---

## 🧠 Architecture Overview

The project is split into:

- **Frontend (React)**
- **Backend (Node.js + Socket.IO)**
- **Shared real-time event system**

Each stroke is streamed incrementally with `strokeId` tracking for smooth collaborative rendering.

---

## 📁 Project Structure
src/
├── App.jsx                          → Root application entry
│
├── data/
│   └── constants.js                 
│
├── icons/
│   └── index.jsx               
│
├── components/
│
│   ├── ui/                          
│   │   ├── Btn.jsx
│   │   ├── Avatar.jsx
│   │   └── Divider.jsx
│   │
│   ├── canvas/                     
│   │   ├── CanvasArea.jsx           
│   │   ├── StickyNote.jsx           
│   │   ├── EmptyState.jsx          
│   │   └── ZoomControls.jsx         
│   │
│   ├── layout/                     
│   │   ├── Navbar.jsx
│   │   ├── NavBtn.jsx
│   │   └── HamDrawer.jsx
│   │
│   ├── toolbar/                     
│   │   ├── Toolbar.jsx
│   │   ├── ColorPicker.jsx
│   │   ├── StrokeMenu.jsx
│   │   ├── EraserMenu.jsx
│   │   ├── ShapeDropdown.jsx
│   │   └── BgPicker.jsx
│   │
│   └── extras/                     
│       ├── Fonts.jsx
│       ├── ArtDecor.jsx
│       ├── IntroScreen.jsx
│       ├── ExportModal.jsx
│       └── ClearConfirm.jsx

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| H | Pan tool |
| P | Pen |
| K | Pencil |
| S | Shape tool |
| N | Sticky note |
| E | Eraser |
| R / O / L / A | Rectangle / Ellipse / Line / Arrow |
| Ctrl + Z | Undo |
| Ctrl + Y | Redo |
| Ctrl + E | Export canvas |

---

## 🛠 Tech Stack

- React (Frontend UI)
- Canvas API (Drawing engine)
- Socket.IO (Real-time sync)
- Node.js + Express (Backend server)

---

## 💡 Notes

- Designed for low-latency collaborative drawing
- Optimized for continuous stroke streaming
- Built to handle multiple users without canvas conflicts

---

## 🧩 Future Improvements

- Pressure-sensitive pen support
- Replay drawing history
- Layer system
- Cloud save / login system
- Mobile touch optimization

---

## 🧑‍🎨 Built With Love

A chaotic-but-smooth real-time canvas built for creativity, collaboration, and slightly unhinged sketch energy.
