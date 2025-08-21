import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class MCPClient {
  private client: Client;

  constructor() {
    this.client = new Client(
      {
        name: "typescript-mcp-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
  }

  async connectToStdioServer() {
    // サーバープロセスを起動
    const serverProcess = spawn('tsx', ['src/server.ts'], {
      env: { ...process.env, MCP_MODE: 'stdio' }
    });

    const transport = new StdioClientTransport({
      command: 'tsx',
      args: ['src/server.ts'],
      env: { ...process.env, MCP_MODE: 'stdio' }
    });

    await this.client.connect(transport);
    console.log("MCPサーバーに接続しました");
  }

  async connectToHttpServer(baseUrl: string = 'http://localhost:8080') {
    // HTTP接続の場合（簡易実装）
    this.httpBaseUrl = baseUrl;
    console.log(`HTTPサーバーに接続: ${baseUrl}`);
  }

  private httpBaseUrl?: string;

  async listTools() {
    if (this.httpBaseUrl) {
      // HTTP経由でツール一覧を取得
      const response = await fetch(`${this.httpBaseUrl}/tools`);
      const data = await response.json();
      return data.tools;
    } else {
      // MCP経由でツール一覧を取得
      const response = await this.client.listTools();
      return response.tools;
    }
  }

  async callTool(toolName: string, args: Record<string, any>) {
    if (this.httpBaseUrl) {
      // HTTP経由でツールを呼び出し
      const response = await fetch(`${this.httpBaseUrl}/tools/${toolName}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });
      const data = await response.json();
      return data.result;
    } else {
      // MCP経由でツールを呼び出し
      const response = await this.client.callTool({
        name: toolName,
        arguments: args,
      });
      return (response.content as Array<{ text: string }>)[0].text;
    }
  }

  async close() {
    if (!this.httpBaseUrl) {
      await this.client.close();
    }
  }
}

// 使用例
async function main() {
  const client = new MCPClient();

  try {
    // HTTPサーバーに接続（サーバーが別途起動されている必要があります）
    await client.connectToHttpServer();

    // または stdio経由で接続
    // await client.connectToStdioServer();

    // ツール一覧を取得
    console.log("利用可能なツール:");
    const tools = await client.listTools();
    tools.forEach((tool: any) => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });

    // 天気を取得
    console.log("\n東京の天気を取得中...");
    const weather = await client.callTool("getWeather", { place: "東京" });
    console.log(`東京の天気: ${weather}`);

    // 現在時刻を取得
    console.log("\n現在時刻を取得中...");
    const time = await client.callTool("getTime", {});
    console.log(`現在時刻: ${time}`);

  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    await client.close();
  }
}

// メイン関数を実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
