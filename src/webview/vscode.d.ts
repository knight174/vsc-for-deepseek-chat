interface WebviewApi<T> {
  getState(): T;
  setState(state: T): void;
  postMessage(message: any): void;
}

declare function acquireVsCodeApi<T = unknown>(): WebviewApi<T>;
declare module 'react-dom/client';
