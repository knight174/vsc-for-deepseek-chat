import * as vscode from 'vscode';
import { ChatPanel } from './webview/ChatPanel';

export function activate(context: vscode.ExtensionContext) {
  console.log('DeepSeek Chat 插件已激活');

  // 注册命令：打开聊天面板
  const openChatCommand = vscode.commands.registerCommand(
    'deepseek-chat.openChat',
    () => {
      ChatPanel.createOrShow(context.extensionUri);
    }
  );

  context.subscriptions.push(openChatCommand);
}

export function deactivate() {}
