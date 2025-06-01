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
- macOS (tested; other platforms may require adjustments)

### Installing LLDB via Homebrew (Recommended)

To ensure you have the latest version of LLDB, install it via Homebrew:

```sh
brew install llvm
```

This will install LLDB and related tools to `/opt/homebrew/opt/llvm/bin` (Apple Silicon) or `/usr/local/opt/llvm/bin` (Intel Macs).

#### Add Homebrew LLDB to your PATH

Add the following to your shell profile (e.g., `~/.zshrc` or `~/.bash_profile`):

```sh
# For Apple Silicon (M1/M2):
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"

# For Intel Macs:
# export PATH="/usr/local/opt/llvm/bin:$PATH"
```

Then reload your shell profile:

```sh
source ~/.zshrc  # or source ~/.bash_profile
```

You can verify the correct LLDB is being used with:

```sh
which lldb
lldb --version
```

## Getting Started

1. **Install dependencies:**
   - Python 3
   - LLDB (see above)
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
   - Use the command palette (`Cmd+Shift+P`/`Ctrl+Shift+P`) and run `Open Visualizer`.

## Extension Settings

This extension does not currently contribute any custom settings.

## Known Issues

- Only tested on macOS; Linux/Windows support is experimental.
- Requires LLDB and Python 3 to be installed and available in your PATH.
- The backend uses a custom Python script and socket communication.

---

For more information, see the [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines).
