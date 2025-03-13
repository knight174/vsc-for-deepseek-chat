import * as vscode from 'vscode';
import { getNonce } from '../utils/getNonce';

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;

    // 设置 WebView 内容
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // 处理消息
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'sendMessage':
            try {
              const response = await this._sendToOllama(message.text);
              this._panel.webview.postMessage({
                command: 'receiveMessage',
                text: response,
                isUser: false,
              });
            } catch (error) {
              vscode.window.showErrorMessage(`与 Ollama 通信失败: ${error}`);
            }
            break;
        }
      },
      null,
      this._disposables
    );

    // 当面板关闭时清理资源
    this._panel.onDidDispose(
      () => {
        this.dispose();
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'deepseekChat',
      'Deep Seek Chat',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'media'),
          vscode.Uri.joinPath(extensionUri, 'dist'),
        ],
      }
    );

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
  }

  private async _sendToOllama(text: string): Promise<string> {
    try {
      const { OllamaService } = await import('../services/ollamaService');

      const config = vscode.workspace.getConfiguration('deepseekChat');
      const baseUrl =
        config.get<string>('ollamaBaseUrl') || 'http://localhost:11434';
      const modelName =
        config.get<string>('ollamaModelName') || 'deepseek-r1:latest';

      const ollamaService = new OllamaService(baseUrl, modelName);
      return await ollamaService.sendMessage(text);
    } catch (error) {
      console.error('Ollama 通信错误:', error);
      throw new Error(
        `与 Ollama 通信失败: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const nonce = getNonce();

    // 获取 React 入口文件
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js')
    );

    // 获取样式文件
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'dist', 'webview.css')
    );

    // 获取 marked 和 highlight.js
    const markedUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'marked.min.js')
    );
    const highlightJsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'highlight.min.js')
    );
    const highlightCssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'media', 'github.min.css')
    );

    return /*html*/ `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
      <title>Deep Seek Chat</title>
      <link href="${styleUri}" rel="stylesheet">
      <link href="${highlightCssUri}" rel="stylesheet">
      <script nonce="${nonce}" src="${markedUri}"></script>
      <script nonce="${nonce}" src="${highlightJsUri}"></script>
    </head>
    <body>
      <div id="root"></div>
      <script nonce="${nonce}" src="${scriptUri}"></script>
      <script nonce="${nonce}">
        console.log('hello deepseek');
      </script>
    </body>
    </html>`;
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
