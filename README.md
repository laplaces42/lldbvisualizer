# LLDB Visualizer VS Code Extension

LLDB Visualizer is a Visual Studio Code extension that provides an interactive, graphical visualization of LLDB debugging sessions. It features a custom webview UI for inspecting threads, stack frames, registers, local variables, and heap memory in real time.

## Features

- Visualize threads, stack frames, and call stacks
- Inspect registers and local variables
- Interactive heap and memory visualization
- Set and manage breakpoints
- Custom webview UI built with React
- Real-time updates from the LLDB backend

## Requirements

- **Python 3** (for backend)
- **LLDB** (must be installed and available in your PATH)
- **Node.js & npm** (for building the webview UI)
- macOS (tested; other platforms may require adjustments)

## Getting Started

1. **Install dependencies:**
   - Python 3
   - LLDB
   - Node.js and npm

2. **Build the webview UI:**
   ```sh
   cd webview-ui
   npm install
   npm run build
   ```
   The build output will be placed in `webview-ui/build` (see below for customizing output location).

3. **Run/Debug the extension:**
   - Open the root folder in VS Code.
   - Press `F5` to launch the extension in a new Extension Development Host window.
   - Use the command palette (`Cmd+Shift+P`/`Ctrl+Shift+P`) and run `LLDB Visualizer: Open Visualizer`.

## Extension Settings

This extension does not currently contribute any custom settings.

## Known Issues

- Only tested on macOS; Linux/Windows support is experimental.
- Requires LLDB and Python 3 to be installed and available in your PATH.
- The backend uses a custom Python script and socket communication.

## Development

- The backend is in `backend/` (Python).
- The webview UI is in `webview-ui/` (React/TypeScript).
- The VS Code extension code is in `src/`.

## Building the Webview UI to the Root `build/` Folder

To output the React build to the root `build/` folder, set the `build` path in `webview-ui/package.json`:

```json
"scripts": {
  "build": "react-scripts build && cp -R build ../build"
}
```

Or use a custom build script to copy the output after building.

## Release Notes

### 1.0.0
- Initial release of LLDB Visualizer

---

For more information, see the [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines).
