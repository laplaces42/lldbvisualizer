// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as net from 'net';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let socket: net.Socket | null = null;
export function activate(context: vscode.ExtensionContext) {

	const webView = vscode.commands.registerCommand('lldbvisualizer.openVisualizer', () => {
		const panel = vscode.window.createWebviewPanel("lldbVisualizer", "lldbVisualizer", vscode.ViewColumn.One, {enableScripts: true});
		const htmlPath = path.join(context.extensionPath, 'build', 'index.html');
		let htmlContent = fs.readFileSync(htmlPath, 'utf8');
		htmlContent = htmlContent.replace(/(src|href)="(.+?)"/g, (_, attr, src) => {
			const resourcePath = vscode.Uri.file(path.join(path.join(context.extensionPath, 'build'), src));
			const webviewUri = panel.webview.asWebviewUri(resourcePath);
			return `${attr}="${webviewUri}"`;
			});
		panel.webview.html = htmlContent;

		
		const memoryLogPath = path.join(context.globalStorageUri.fsPath, 'memory_log.jsonl');
		const snapshotPath = path.join(context.globalStorageUri.fsPath, 'snapshot.json');
		
		const pythonExecutable = "/opt/homebrew/bin/python3";
		const backendPath = path.join(context.extensionPath, 'backend/lldb_runner.py');
		
		const terminal = vscode.window.createTerminal("LLDB Backend");
		terminal.show();
		terminal.sendText("\n", true);
		terminal.sendText("clear", true);
		terminal.sendText(`${pythonExecutable} "${backendPath}" "${memoryLogPath}" "${snapshotPath}"`, true);
		
		const connectToSocket = () => {
			const client = new net.Socket();
			client.connect(4952, '127.0.0.1', () => {
				console.log('[socket] Connected to backend');
				socket = client;
			});

			client.on('data', (data) => {
				const message = data.toString();
				panel.webview.postMessage({ data: JSON.parse(message) });
			});

			client.on('error', (err) => {
				console.log('[socket] Connection failed, retrying in 500ms...');
				setTimeout(connectToSocket, 500); // Retry connection every 500ms
			});
		};

		connectToSocket();
		panel.webview.onDidReceiveMessage(async (message) => {

			if (message.type === "debug-command") {
				terminal.sendText("\u0015", false);
				terminal.sendText(message.command, true);
			} else {
				if (socket) {
					socket.write(JSON.stringify(message));
				} else {
					console.error('[socket] Socket is not connected');
				}
			}
		});
	});

	context.subscriptions.push(webView);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
