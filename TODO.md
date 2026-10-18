# Project Tasks & Roadmap (TODO)

This document tracks planned features, workflow enhancements, bug fixes, and improvements for the **VietnameseHandwritingGenerator** project.

---

## 1. Editor & Data Workflow Improvements

- [x] **Direct `all.json` Import for Editor Continuity**
  - **Problem**: Continuing work on the glyph editor currently requires an excessively cumbersome roundtrip: editing glyphs -> downloading `all.json` -> manually placing it into the repository backend -> restarting/reloading the server -> resuming work the next day.
  - **Solution**:
    - Add an **"Import JSON"** button / drag-and-drop zone directly on the Editor page (`editor/index.html`).
    - Allow users to immediately load an external or previous `all.json` file into browser memory (`model.glyphData`) without modifying the backend source files.
    - Eliminate intermediate backend deployment steps for iterative glyph design work.

- [ ] **Easier Synchronization & Updates for `all.json`**
  - **Problem**: Manually replacing `/data/all.json` in source control or dev servers is error-prone.
  - **Solution**:
    - Provide a more streamlined sync mechanism, such as:
      - Local dev auto-sync API endpoint (POST endpoint in backend to overwrite `/data/all.json` during local development).
      - Browser File System Access API (`showOpenFilePicker` / `showSaveFilePicker`) for direct local disk reading and writing where supported.
      - Session staging in `localStorage` with prompt to persist or download when changes are detected.

- [x] **Timestamped `all.json` Export Filename**
  - **Problem**: Repeatedly downloading `all.json` produces confusing browser duplicate filenames (e.g., `all (1).json`, `all (2).json`), making it difficult to identify the newest configuration.
  - **Solution**:
    - Include a readable ISO or compact timestamp in the exported filename (e.g., `all-20261016-143000.json` or `glyphs-YYYY-MM-DD_HH-mm.json`).
    - Keep a copy button / option for raw `all.json` when overwriting is intended.

---

## 2. Editor UI & Visual Indicators

- [x] **Dynamic Multi-Dot Configuration Indicator on Overview Cards**
  - **Problem**: On the Editor overview grid (`components.baseCard` in `editor/js/components.js`), any glyph with dotting configuration only displays a single generic red dot badge (`●`), obscuring characters that possess multiple dot configurations.
  - **Solution**:
    - Update `view.js` and `components.js` in `editor/` to inspect `data.dotConfigs.length`.
    - Render the exact number of dots corresponding to the number of configured dot profiles (e.g., if a glyph has 2 dot configurations, display 2 dots on the top-right corner of the card).
    - Provide tooltip details displaying the configuration count on hover.

---

## 3. Document Export & Printing

- [ ] **Fix Broken Print Feature & Implement Direct PDF Export**
  - **Problem**: The current "In bài viết" (`window.print()`) functionality is broken:
    - Browser print engines clip CSS Grid row tracks, struggle with background canvas tiling, or misalign guideline strokes across page breaks.
  - **Solution**:
    - **Native Print Fix**: Audit and adjust `@media print` rules in `static/css/board.css` for proper pagination, background graphics rendering (`-webkit-print-color-adjust: exact`), and row height constraints.
    - **PDF Export Feature**: Implement direct, reliable client-side PDF export (similar to the existing 4x Ultra HD PNG export pipeline using `html2canvas` / `jsPDF`), producing printable A4-sized PDF documents directly without relying on browser print dialogs.

---

## 4. State Persistence & Project File (.psd-like format)

- [x] **Workspace State Persistence (LocalStorage & Project Export/Import)**
  - **Problem**: Reloading the page or closing the browser loses current draft work (text content, per-line dotting, per-word horizontal stretching, custom spacing, font size, and layout settings).
  - **Solution**:
    - **Auto-save**: Store the active session state in browser `localStorage` to preserve work across accidental refreshes or browser restarts.
    - **Project File Export/Import**: Create a dedicated project file format (JSON-based, analogous to a `.psd` source file for image editing) containing:
      - Raw text input and line configurations.
      - Custom word stretching factors and spacing adjustments.
      - Dot configs and active dotting modes.
      - Board dimensions, layout type (normal infinite vs. 11x14 board vs. blackboard), and styling presets.
    - Allow users to export `.chudep` / `.json` project files and import them later to resume editing or re-export at different resolutions.
  - **Future Backend Integration**: User accounts with cloud-saved documents and presets.

- [x] **Freestyle Runtime Dotting (Chấm Tự Do & Interactive SVG Mini-Editor)**
  - **Problem**: Previously, users could only choose fixed preset dotting configurations defined statically in the glyph editor. There was no way to add or reposition dots dynamically for specific words or custom practice exercises.
  - **Solution**:
    - Interactive SVG ô ly grid modal dialog (`#freestyleDottingModal`) with 56px cells, guidelines (ĐK1, ĐK3, ĐK5, ĐK Dưới, X=0), pointer-capture dragging, coordinate inputs, and snap-to-0.25-ô-ly.
    - Application scope options: customize a specific word instance or apply to all identical characters across the document.
    - Full persistence in localStorage auto-save, project file export/import (`.chudep` / `.json`), and Ultra HD PNG export across all layouts (Standard, Blackboard, White 11x14).

---

## 5. Glyph Library & Content Expansion

- [ ] **Add Numbers & Digits (0–9)**
  - Introduce full metric and dot configuration data for digits `0` through `9` into the editor and font dataset to support math practice sheets and numbered exercises.

- [ ] **Add Foundational Handwriting Strokes (Nét Cơ Bản)**
  - Add individual primary stroke glyphs into the editor and font mapping:
    - Nét sổ (thẳng đứng), nét ngang.
    - Nét xiên trái, nét xiên phải.
    - Nét móc xuôi, nét móc ngược, nét móc hai đầu.
    - Nét cong hở phải, nét cong hở trái, nét cong kín.
    - Nét khuyết trên, nét khuyết dưới, nét thắt.
  - Enable teachers and parents to generate step-by-step stroke practice worksheets for early learners.

---

## 6. Credits & Attribution

- [x] **Update Project Credits & Source Links**
  - **Creator**: Credit project creator **catmandx** with an explicit link to the GitHub repository:
    - [VietnameseHandwritingGenerator on GitHub](https://github.com/catmandx-llm-playground/VietnameseHandwritingGenerator)
  - **Font Creator**: Credit font creator **Nhà in HP** / **Nha in HP** with a link to their download portal:
    - [Nhà in HP (nhainhp.com)](http://nhainhp.com/?page=taive)
  - Update mentions across `README.md`, `index.html` footer/about modals, and `editor/index.html`.
