import type { Request, Response } from 'express';
import { SLASH_COMMANDS } from '../src/data/discordTemplates.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export default async function handler(req: Request, res: Response) {
  const botToken = (req.headers['x-bot-token'] as string) || req.body?.botToken || process.env.DISCORD_TOKEN;
  const appId = (req.headers['x-app-id'] as string) || req.body?.appId || process.env.DISCORD_APPLICATION_ID;
  const guildId = (req.query.guildId as string) || req.body?.guildId || process.env.GUILD_ID;

  if (!botToken || !appId) {
    return res.status(400).json({
      error: 'Missing required credentials',
      message: 'Provide DISCORD_TOKEN and DISCORD_APPLICATION_ID in environment variables or request headers.',
    });
  }

  try {
    const url = guildId
      ? `${DISCORD_API_BASE}/applications/${appId}/guilds/${guildId}/commands`
      : `${DISCORD_API_BASE}/applications/${appId}/commands`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SLASH_COMMANDS),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: guildId
        ? `Successfully registered ${data.length} Slash Commands to Guild ID: ${guildId} (Instant propagation)`
        : `Successfully registered ${data.length} Global Slash Commands (Propagates in ~1 hour)`,
      commands: data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to register commands',
    });
  }
}
