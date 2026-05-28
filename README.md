**Henle Animation**

- **Description:** A small interactive animation project that demonstrates color maps and drawing utilities for visualizations and multiple-choice interactions.
- **Run:** Open the app in a browser or serve the folder with a simple HTTP server.

**Quick Start**

- Open locally: open [index.html](index.html) in your browser.
- Or run a local server (recommended) and visit `http://localhost:8000`:


**Files Overview**

- **index.html:** App entry page and demo container. ([index.html](index.html))
- **main.js:** Startup and app wiring.
- **draw.js:** Core drawing routines for canvas/SVG.
- **mcq_handle.js:** Multiple-choice question handling and UI logic. ([mcq_handle.js](mcq_handle.js))
- **model.js:** Data/model definitions and state transformations.
- **state.js:** Application state management.
- **ui.js:** UI helpers and event bindings.
- **svg.js:** SVG-specific utilities.
- **colormaps.js:** Color map definitions used by the visualizations.
- **config.js:** Project configuration and constants.
- **style.css:** Visual styles for the demo.
- **utils.js:** Small helper utilities.

**Usage Notes**
- Works in modern browsers (Chrome, Edge, Firefox). Use a local server to avoid CORS/local file issues.
