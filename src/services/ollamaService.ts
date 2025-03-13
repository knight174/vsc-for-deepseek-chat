import axios from 'axios';

export interface OllamaResponse {
  response: string;
  done: boolean;
}

export class OllamaService {
  private baseUrl: string;
  private modelName: string;

  constructor(
    baseUrl: string = 'http://localhost:11434',
    modelName: string = 'deepseek-r1:latest'
  ) {
    this.baseUrl = baseUrl;
    this.modelName = modelName;
  }

  async sendMessage(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.modelName,
        prompt: prompt,
        stream: false,
      });

      if (response.data && response.data.response) {
        return response.data.response;
      }

      throw new Error('无效的响应格式');
    } catch (error) {
      console.error('Ollama API 错误:', error);
      throw error;
    }
  }

  async streamMessage(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.modelName,
          prompt: prompt,
          stream: true,
        },
        {
          responseType: 'stream',
        }
      );

      response.data.on('data', (chunk: Buffer) => {
        try {
          const lines = chunk
            .toString()
            .split('\n')
            .filter((line) => line.trim());
          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.response) {
              onChunk(data.response);
            }
          }
        } catch (e) {
          console.error('解析流数据错误:', e);
        }
      });
    } catch (error) {
      console.error('Ollama 流式 API 错误:', error);
      throw error;
    }
  }
}
