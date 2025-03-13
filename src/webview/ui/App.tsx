import React, { useState, useEffect } from 'react';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';

// 定义状态接口
interface ChatState {
  messages: Array<{ text: string; isUser: boolean }>;
}

// 使用泛型指定状态类型
const vscode = acquireVsCodeApi<ChatState>();

export const App: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ text: string; isUser: boolean }>
  >([]);
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'receiveMessage') {
        setMessages((prev) => [
          ...prev,
          { text: message.text, isUser: message.isUser },
        ]);
        setThinking(false);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { text, isUser: true }]);
    setThinking(true);

    vscode.postMessage({
      command: 'sendMessage',
      text,
    });
  };

  return (
    <div className="chat-container">
      {/* <div className="chat-header">Deep VS Code Extension</div> */}
      <ChatHistory messages={messages} thinking={thinking} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};
