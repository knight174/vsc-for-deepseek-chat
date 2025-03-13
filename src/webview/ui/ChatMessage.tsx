import React, { useEffect, useRef } from 'react';

interface ChatMessageProps {
  text: string;
  isUser: boolean;
}

declare const marked: {
  parse: (markdown: string) => string;
};
declare const hljs: any;

export const ChatMessage: React.FC<ChatMessageProps> = ({ text, isUser }) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUser && messageRef.current) {
      const content = marked.parse(text);
      messageRef.current.innerHTML = content;

      // 对代码块应用语法高亮
      messageRef.current.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [text, isUser]);

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      {isUser ? <div>{text}</div> : <div ref={messageRef}></div>}
    </div>
  );
};
