import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool 
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { 
  getWeatherTool, 
  getWeather, 
  getTimeTool, 
  getTime 
} from './tools/weatherService.js';

class MCPWeatherServer {
  private server: Server;
  private tools: Tool[];

  constructor() {
    this.server = new Server(
      {
        name: "typescript-weather-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = [
      {
        name: getWeatherTool.name,
        description: getWeatherTool.description,
        inputSchema: getWeatherTool.inputSchema,
      },
      {
        name: getTimeTool.name,
        description: getTimeTool.description,
        inputSchema: getTimeTool.inputSchema,
      }
    ];

    this.setupHandlers();
  }

  private setupHandlers() {
    // ツール一覧の取得
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tools,
      };
    });

    // ツールの実行
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "getWeather": {
            const place = args?.place as string;
            if (!place) {
              throw new Error("場所が指定されていません");
            }
            const result = getWeather(place);
            return {
              content: [
                {
                  type: "text" as const,
                  text: result,
                },
              ],
            };
          }

          case "getTime": {
            const result = getTime();
            return {
              content: [
                {
                  type: "text" as const,
                  text: result,
                },
              ],
            };
          }

          default:
            throw new Error(`未知のツール: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "不明なエラー";
        return {
          content: [
            {
              type: "text" as const,
              text: `エラー: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // stdio mode で起動
  async runStdio() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("TypeScript MCP Weather Server running on stdio");
  }

  // SSE mode で起動（Express使用）
  async runSSE(port: number = 8080) {
    const app = express();
    
    app.use(express.json());
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });

    // SSE エンドポイント
    app.get('/sse', async (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // MCP over SSE の実装（簡略化）
      // 実際の実装では、MCPプロトコルに従ったメッセージングが必要
      res.write(`data: ${JSON.stringify({
        jsonrpc: "2.0",
        method: "server/initialized",
        params: {}
      })}\n\n`);

      req.on('close', () => {
        res.end();
      });
    });

    // ツール一覧の取得（REST API として）
    app.get('/tools', (req, res) => {
      res.json({ tools: this.tools });
    });

    // ツールの実行（REST API として）
    app.post('/tools/:toolName/call', async (req, res) => {
      const { toolName } = req.params;
      const args = req.body;

      try {
        switch (toolName) {
          case "getWeather": {
            const result = getWeather(args.place);
            res.json({ result });
            break;
          }
          case "getTime": {
            const result = getTime();
            res.json({ result });
            break;
          }
          default:
            res.status(404).json({ error: `未知のツール: ${toolName}` });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "不明なエラー";
        res.status(500).json({ error: errorMessage });
      }
    });

    app.listen(port, () => {
      console.log(`TypeScript MCP Weather Server running on http://localhost:${port}`);
      console.log(`SSE endpoint: http://localhost:${port}/sse`);
      console.log(`Tools API: http://localhost:${port}/tools`);
    });
  }
}

// 起動方法の選択
const mode = process.env.MCP_MODE || 'sse';

const server = new MCPWeatherServer();

if (mode === 'stdio') {
  server.runStdio().catch(console.error);
} else {
  const port = parseInt(process.env.PORT || '8080');
  server.runSSE(port).catch(console.error);
}
