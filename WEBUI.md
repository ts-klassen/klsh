# ⚠️  IMPORTANT: The Web UI is 100 % client-side. It must make **NO external network requests** and require **NO backend servers**. All execution happens locally in the browser via Web Workers and IndexedDB.

# Web UI Implementation Plan

This document describes how to implement the web interface while fully satisfying every requirement outlined in `REQUIREMENTS.md`.

---

## 0  Guiding principles

* **Single source-of-truth** – an in-memory *Pipeline JSON* following the exact schema from `REQUIREMENTS.md`.
* All UI elements (visual canvas, text editor, terminal, file manager …) are *views* of that JSON. They subscribe to store updates and re-render, guaranteeing that the drag-and-drop and text modes stay in sync at all times.
* Execution runs inside a Web Worker so the main UI thread never blocks.

---

## 1  Technology stack

| Concern            | Choice | Rationale |
|--------------------|--------|-----------|
| UI framework       | React 18 + Zustand | React is widely known and supports custom per-component panels. Zustand is a 1 KB state store that holds the Pipeline JSON. |
| Drag-and-drop DAG  | React-Flow | MIT-licensed, purpose-built for node-and-edge editors. |
| Text editor        | Monaco Editor | Same code base as VS Code; easy to add syntax highlighting. |
| Terminal / output  | xterm.js | Handles ANSI colours emitted by klsh. |
| Bundler            | Vite | Fast dev server & static build, zero config. |
| Styling            | CSS variables (+ optional Tailwind) | Light/dark themes, responsive break-points. |

---

## 2  Directory layout

```text
webui/
  vite.config.js
  index.html
  src/
    main.jsx              # bootstraps React + Zustand provider
    store/pipeline.js     # holds Pipeline JSON + history
    workers/runner.js     # imports dist/klsh.js, executes pipelines
    components/
      Canvas.jsx          # visual builder (React-Flow)
      TextEditor.jsx      # Monaco editor
      Terminal.jsx        # xterm.js log + stdout/stderr panes
      FileManager.jsx     # IndexedDB file browser/editor
      ComponentPalette.jsx# searchable list of components (uses getDescription)
      ConfigPanel.jsx     # auto-generated or custom UI per component
    util/
      json2flow.js        # JSON → React-Flow nodes/edges
      flow2json.js        # React-Flow → JSON
      text2json.js        # uses existing parser
      json2text.js        # pretty-prints JSON back to Bash
```

---

## 3  Data-flow diagram

```text
               +-----------------+    update
               |  Zustand store  |<-------------+
               |  Pipeline JSON  |              |
               +-----------------+              |
      ▲  update()       ▲        ▲    update()  |
      |                 |        |              |
  Canvas ───────────────┘        |              |
      │                          |              |
  ConfigPanel ────────────┐      |              |
                           │      |              |
                TextEditor │      |              |
                           │      |              |
                         FileManager────────────┘

• Any view dispatches an action → store updates Pipeline JSON.
• Store notifies all subscribers → every view re-renders.
• “Run” button posts JSON to Runner worker, which streams `{stdout, stderr, exitCode}` back to Terminal.
```

---

## 4  Visual builder – `Canvas.jsx`

* Uses React-Flow to render nodes (components) and edges (pipes).
* Clicking a node selects it and opens `ConfigPanel`.
* Edge context menu allows delete, insert, or reorder operations.

---

## 5  Configuration panel – `ConfigPanel.jsx`

1. Reads the currently selected component id from the store.
2. If the component exports `getCustomUI()` it renders that React node, passing helpers so the component can mutate its own sub-tree in Pipeline JSON.
3. Otherwise an auto-generated form is built from `getOptions()`:
   * `flag` → checkbox
   * `string` → text field
   * Tooltip text comes from the option’s `help` property.

---

## 6  Text mode – `TextEditor.jsx`

* Hosts Monaco Editor with a simple tokeniser for commands, pipes, and redirection operators.
* **Debounced** onChange handler parses the text (`text2json`) and, if valid, writes the resulting JSON to the store.
* Whenever the store changes for another reason, `json2text` regenerates the string, updating the editor (with change-origin guards to avoid loops).

---

## 7  Execution engine – `workers/runner.js`

* Runs in a Web Worker to keep the UI responsive.
* Imports `dist/klsh.js`, listens for messages `{pipelineJSON, stdin}`.
* Converts the JSON to the internal AST if needed, then calls `klsh.klsh.main()`.
* Posts streamed `{stdout, stderr, exitCode}` chunks back to the main thread so `Terminal.jsx` can display live output.

---

## 8  File I/O – `FileManager.jsx`

* Lists files via an IndexedDB cursor over the `klsh_files` store.
* Lets users view, edit, delete, or download files.
* Drag-and-drop: dropping a local file calls `klsh.fs.writeFile()` with its text content.

---

## 9  Responsive design

* **Desktop (≥ 1024 px)** – Three-column grid: Palette | Canvas | ConfigPanel.
* **Tablet (600–1023 px)** – Palette collapsible; ConfigPanel becomes a bottom sheet.
* **Mobile (≤ 599 px)** – Tab bar (Build • Text • Run • Files); each tab takes full screen.

---

## 10  Accessibility & i18n

* All interactive elements include ARIA roles and keyboard shortcuts.
* Visible labels and tooltips use a string table for future translation.

---

## 11  Build & deploy workflow

```bash
# one-time setup
npm install \
  react react-dom zustand react-flow-renderer monaco-editor xterm vite

# development workflow
npm run build            # existing klsh bundle (dist/klsh.js)
npm run dev:webui        # vite dev server (hot-reloading)

# production
npm run build:webui      # vite build → webui/dist (static assets)
```

The resulting `webui/dist` directory is entirely static and can be hosted on GitHub Pages or any CDN.

---

## 12  Phased delivery milestones

| Milestone | Scope |
|-----------|-------|
| **M1** | Scaffold project; Zustand store with empty JSON; Canvas + TextEditor syncing (no execution yet). |
| **M2** | ComponentPalette with search; ConfigPanel with auto-generated forms; uses `getDescription()` & `getOptions()`. |
| **M3** | Runner Web Worker; xterm.js Terminal; execute pipelines; FileManager listing. |
| **M4** | Responsive layout polish; drag-and-drop file upload; custom component UIs; accessibility pass. |

---

## Outcome

This plan delivers:

* A drag-and-drop **visual builder** and a **text editor**, always in sync.
* Execution feedback with separate stdout / stderr streams.
* Full support for components’ `getDescription()`, `getOptions()`, and optional `getCustomUI()`.
* Mobile-friendly, accessible design.
* Zero server dependencies – everything runs in the browser using the existing `klsh` bundle and IndexedDB file-system.
