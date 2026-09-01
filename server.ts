import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import interactionsHandler from './api/interactions.js';
import registerHandler from './api/register.js';
import { askGeminiForDiscord } from './src/services/geminiService.js';
import {
  executeSetupServer,
  executeSetupRoles,
  fetchGuildDetails,
  fetchSlashCommands,
} from './src/services/discordApi.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Capture raw body for Discord Ed25519 signature verification
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  // Enable CORS
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Signature-Ed25519, X-Signature-Timestamp, x-bot-token, x-app-id'
    );
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // -----------------------------------------------------------
  // API Routes (must precede Vite middleware)
  // -----------------------------------------------------------

  // 1. Health & Config status check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      botName: 'Server Architect',
      timestamp: new Date().toISOString(),
      envStatus: {
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        hasDiscordToken: !!process.env.DISCORD_TOKEN,
        hasPublicKey: !!process.env.DISCORD_PUBLIC_KEY,
        hasAppId: !!process.env.DISCORD_APPLICATION_ID,
        hasGuildId: !!process.env.GUILD_ID,
        appId: process.env.DISCORD_APPLICATION_ID || null,
        guildId: process.env.GUILD_ID || null,
      },
    });
  });

  // 2. Discord Interactions Webhook Endpoint (Matches Vercel /api/interactions)
  app.all('/api/interactions', async (req: Request, res: Response) => {
    return interactionsHandler(req, res);
  });

  // 3. Register Slash Commands Endpoint
  app.all('/api/register', async (req: Request, res: Response) => {
    return registerHandler(req, res);
  });

  // 4. Gemini AI Ask Endpoint (for in-app playground & direct test)
  app.post('/api/gemini/ask', async (req: Request, res: Response) => {
    try {
      const { prompt, userName } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      const answer = await askGeminiForDiscord(prompt, userName);
      res.json({ success: true, answer });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Discord Live API Proxy: Fetch Guild details & channels
  app.post('/api/discord/guild-info', async (req: Request, res: Response) => {
    const token = req.body.token || process.env.DISCORD_TOKEN;
    const guildId = req.body.guildId || process.env.GUILD_ID;

    if (!token || !guildId) {
      return res.status(400).json({
        error: 'DISCORD_TOKEN and GUILD_ID are required',
      });
    }

    try {
      const details = await fetchGuildDetails(token, guildId);
      res.json({ success: true, ...details });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Discord Live API Proxy: Fetch registered Slash Commands
  app.post('/api/discord/commands', async (req: Request, res: Response) => {
    const token = req.body.token || process.env.DISCORD_TOKEN;
    const appId = req.body.appId || process.env.DISCORD_APPLICATION_ID;
    const guildId = req.body.guildId || process.env.GUILD_ID;

    if (!token || !appId) {
      return res.status(400).json({
        error: 'DISCORD_TOKEN and DISCORD_APPLICATION_ID are required',
      });
    }

    try {
      const commands = await fetchSlashCommands(appId, token, guildId);
      res.json({ success: true, commands });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Discord Live API Proxy: Execute Setup Server
  app.post('/api/discord/setup-server', async (req: Request, res: Response) => {
    const token = req.body.token || process.env.DISCORD_TOKEN;
    const guildId = req.body.guildId || process.env.GUILD_ID;

    if (!token || !guildId) {
      return res.status(400).json({
        error: 'DISCORD_TOKEN and GUILD_ID are required',
      });
    }

    try {
      const logs: string[] = [];
      const result = await executeSetupServer(token, guildId, (e) => {
        logs.push(`[${e.status.toUpperCase()}] ${e.message}`);
      });
      res.json({ success: true, result, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Discord Live API Proxy: Execute Setup Roles
  app.post('/api/discord/setup-roles', async (req: Request, res: Response) => {
    const token = req.body.token || process.env.DISCORD_TOKEN;
    const guildId = req.body.guildId || process.env.GUILD_ID;

    if (!token || !guildId) {
      return res.status(400).json({
        error: 'DISCORD_TOKEN and GUILD_ID are required',
      });
    }

    try {
      const logs: string[] = [];
      const result = await executeSetupRoles(token, guildId, (e) => {
        logs.push(`[${e.status.toUpperCase()}] ${e.message}`);
      });
      res.json({ success: true, result, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // -----------------------------------------------------------
  // Vite Integration (Development vs Production)
  // -----------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Architect running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
