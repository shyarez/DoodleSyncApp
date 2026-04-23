# ✧ DoodleSyncApp

A real-time collaborative drawing canvas featuring live multi-user synchronization, sticky notes, and multi-tool sketching — engineered for low-latency, shared creativity.

---

## ✧ Features

* **Real-time Collaboration:** Multi-user synchronization via Socket.IO.
* **Drawing Suite:** Pen, Pencil, and geometric Shapes (Rectangle, Ellipse, Line, Arrow).
* **Smart Eraser:** Freehand, Lasso, and Rectangular clearing modes.
* **Interactive Elements:** Sticky notes with live sync for text, color, and positioning.
* **Workflow Tools:** Full Undo/Redo support, Canvas clearing, and Export functionality.
* **Navigation:** Integrated Zoom and Pan support for large-scale sketching.
* **Optimization:** Stroke streaming and high-performance Canvas API rendering.

---

## ✧ Architecture Overview

The system architecture facilitates continuous data flow between clients:

* **Frontend:** React-based UI with custom Canvas API integration.
* **Backend:** Node.js environment utilizing Express and Socket.IO.
* **Event System:** Incremental `strokeId` tracking ensures smooth collaborative rendering without state conflicts.

---

## ✧ Project Structure

```text
src/
 ├── App.jsx                ✧ Root application entry
 │
 ├── data/
 │    └── constants.js      ✧ Global configuration
 │
 ├── icons/
 │    └── index.jsx         ✧ Asset library
 │
 ├── components/
 │    ├── ui/               ✧ Atomic UI elements (Buttons, Avatars)
 │    │
 │    ├── canvas/           ✧ Drawing engine & canvas logic
 │    │    ├── CanvasArea.jsx
 │    │    ├── StickyNote.jsx
 │    │    └── ZoomControls.jsx
 │    │
 │    ├── layout/           ✧ Navigation & structural wrappers
 │    │    ├── Navbar.jsx
 │    │    └── HamDrawer.jsx
 │    │
 │    ├── toolbar/          ✧ Tool selection & customization menus
 │    │    ├── ColorPicker.jsx
 │    │    ├── ShapeDropdown.jsx
 │    │    └── EraserMenu.jsx
 │    │
 │    └── extras/           ✧ Modals, fonts, and decorations
 │         ├── IntroScreen.jsx
 │         └── ExportModal.jsx

```
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

## ✧ Notes
✧ Designed for low-latency collaborative drawing
✧ Optimized for continuous stroke streaming
✧ Built to handle multiple users without canvas conflicts

---

## ✧ Future Roadmap
✧ Pressure-sensitive stylus support
✧ Playback system for drawing history
✧ Layer management system
✧ Persistent cloud storage and user authentication
✧ Enhanced mobile touch gesture optimization

---
