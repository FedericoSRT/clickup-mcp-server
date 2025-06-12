/**
 * SPDX-FileCopyrightText: © 2025 Talib Kareem <taazkareem@icloud.com>
 * SPDX-License-Identifier: MIT
 *
 * SSE and HTTP Streamable Transport Server
 *
 * This module provides HTTP Streamable and legacy SSE transport support
 * for the ClickUp MCP Server. It reuses the unified server configuration
 * from server.ts to avoid code duplication.
 */

import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { server, configureServer } from './server.js';
import configuration from './config.js';

const app = express();
app.use(express.json());

export function startSSEServer() {
  // Configure the unified server first
  configureServer();

  const transports = {
    streamable: {} as Record<string, StreamableHTTPServerTransport>,
    sse: {} as Record<string, SSEServerTransport>,
  };

  // Streamable HTTP endpoint - handles POST requests for client-to-server communication
  app.post('/mcp', async (req, res) => {
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports.streamable[sessionId]) {
        transport = transports.streamable[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          onsessioninitialized: (sessionId) => {
            transports.streamable[sessionId] = transport;
          }
        });

        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports.streamable[transport.sessionId];
          }
        };

        await server.connect(transport);
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  const handleSessionRequest = async (req: express.Request, res: express.Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports.streamable[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = transports.streamable[sessionId];
    await transport.handleRequest(req, res);
  };

  app.get('/mcp', handleSessionRequest);

  app.delete('/mcp', handleSessionRequest);

  // Legacy SSE endpoints (for backwards compatibility)
  app.get('/sse', async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports.sse[transport.sessionId] = transport;

    console.log(
      `New SSE connection established with sessionId: ${transport.sessionId}`
    );

    res.on('close', () => {
      delete transports.sse[transport.sessionId];
    });

    await server.connect(transport);
  });

  app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.sse[sessionId];
    if (transport) {
      await transport.handlePostMessage(req, res, req.body);
    } else {
      res.status(400).send('No transport found for sessionId');
    }
  });

  const PORT = Number(configuration.port ?? '3231');

  // Bind to localhost only for security
  app.listen(PORT, () => {
    console.log(`Server started on http://127.0.0.1:${PORT}`);
    console.log(`Streamable HTTP endpoint: http://127.0.0.1:${PORT}/mcp`);
    console.log(`Legacy SSE endpoint: http://127.0.0.1:${PORT}/sse`);
  });
}
