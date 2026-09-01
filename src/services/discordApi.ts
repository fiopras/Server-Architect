import nacl from 'tweetnacl';
import { BOOMERS_SERVER_TEMPLATE, BOOMERS_ROLES_TEMPLATE, SLASH_COMMANDS } from '../data/discordTemplates';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export interface SetupProgressEvent {
  step: string;
  categoryName?: string;
  channelName?: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
}

/**
 * Verify Discord ed25519 signature
 */
export function verifyDiscordSignature(
  rawBody: string | Buffer,
  signature: string | undefined,
  timestamp: string | undefined,
  publicKey: string | undefined
): boolean {
  if (!signature || !timestamp || !publicKey) return false;
  try {
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + (typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex')
    );
    return isVerified;
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Register slash commands to Discord Guild (Instant) or Global
 */
export async function registerSlashCommands(
  appId: string,
  botToken: string,
  guildId?: string
) {
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

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch registered slash commands
 */
export async function fetchSlashCommands(
  appId: string,
  botToken: string,
  guildId?: string
) {
  const url = guildId
    ? `${DISCORD_API_BASE}/applications/${appId}/guilds/${guildId}/commands`
    : `${DISCORD_API_BASE}/applications/${appId}/commands`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bot ${botToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord API Error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch Guild Information & Channel/Role counts
 */
export async function fetchGuildDetails(botToken: string, guildId: string) {
  const [guildRes, channelsRes, rolesRes] = await Promise.all([
    fetch(`${DISCORD_API_BASE}/guilds/${guildId}?with_counts=true`, {
      headers: { Authorization: `Bot ${botToken}` },
    }),
    fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${botToken}` },
    }),
    fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${botToken}` },
    }),
  ]);

  if (!guildRes.ok) {
    const err = await guildRes.text();
    throw new Error(`Failed to fetch guild (${guildRes.status}): ${err}`);
  }

  const guild = await guildRes.json();
  const channels = channelsRes.ok ? await channelsRes.json() : [];
  const roles = rolesRes.ok ? await rolesRes.json() : [];

  return {
    guild,
    channels,
    roles,
  };
}

/**
 * Execute `/setup-server` on Discord Guild via REST API
 * Creates categories & channels for "The Boomers"
 */
export async function executeSetupServer(
  botToken: string,
  guildId: string,
  onProgress?: (event: SetupProgressEvent) => void
) {
  const createdSummary: Array<{ category: string; channels: string[] }> = [];

  for (const catTemplate of BOOMERS_SERVER_TEMPLATE) {
    onProgress?.({
      step: `Membuat kategori ${catTemplate.name}...`,
      categoryName: catTemplate.name,
      status: 'pending',
      message: `Sedang membuat Category: ${catTemplate.name}`,
    });

    // 1. Create Category Channel (type 4 = GUILD_CATEGORY)
    const catResponse = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: catTemplate.name,
        type: 4,
      }),
    });

    if (!catResponse.ok) {
      const err = await catResponse.text();
      onProgress?.({
        step: `Gagal membuat kategori ${catTemplate.name}`,
        categoryName: catTemplate.name,
        status: 'error',
        message: `Error: ${err}`,
      });
      continue;
    }

    const createdCat = await catResponse.json();
    const categoryId = createdCat.id;
    const catChannelsCreated: string[] = [];

    // 2. Create child channels under this category
    for (const chan of catTemplate.channels) {
      const payload: any = {
        name: chan.name,
        type: chan.type,
        parent_id: categoryId,
      };

      if (chan.topic) payload.topic = chan.topic;
      if (chan.user_limit !== undefined) payload.user_limit = chan.user_limit;

      // Rate limit protection: small delay
      await new Promise((r) => setTimeout(r, 250));

      const chanResponse = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/channels`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (chanResponse.ok) {
        catChannelsCreated.push(chan.name);
        onProgress?.({
          step: `Berhasil membuat ${chan.name}`,
          categoryName: catTemplate.name,
          channelName: chan.name,
          status: 'success',
          message: `Channel ${chan.name} dibuat di ${catTemplate.name}`,
        });
      } else {
        const chanErr = await chanResponse.text();
        onProgress?.({
          step: `Gagal membuat ${chan.name}`,
          categoryName: catTemplate.name,
          channelName: chan.name,
          status: 'warning',
          message: `Gagal membuat channel ${chan.name}: ${chanErr}`,
        });
      }
    }

    createdSummary.push({
      category: catTemplate.name,
      channels: catChannelsCreated,
    });
  }

  return createdSummary;
}

/**
 * Execute `/setup-roles` on Discord Guild
 */
export async function executeSetupRoles(
  botToken: string,
  guildId: string,
  onProgress?: (event: SetupProgressEvent) => void
) {
  const createdRoles: string[] = [];

  for (const roleTemplate of BOOMERS_ROLES_TEMPLATE) {
    onProgress?.({
      step: `Membuat role ${roleTemplate.name}...`,
      status: 'pending',
      message: `Sedang membuat role: ${roleTemplate.name}`,
    });

    await new Promise((r) => setTimeout(r, 250));

    const response = await fetch(`${DISCORD_API_BASE}/guilds/${guildId}/roles`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roleTemplate.name,
        color: roleTemplate.color,
        hoist: roleTemplate.hoist,
        mentionable: roleTemplate.mentionable,
        permissions: roleTemplate.permissions,
      }),
    });

    if (response.ok) {
      createdRoles.push(roleTemplate.name);
      onProgress?.({
        step: `Berhasil membuat role ${roleTemplate.name}`,
        status: 'success',
        message: `Role ${roleTemplate.name} telah terpasang.`,
      });
    } else {
      const err = await response.text();
      onProgress?.({
        step: `Gagal membuat role ${roleTemplate.name}`,
        status: 'error',
        message: `Gagal: ${err}`,
      });
    }
  }

  return createdRoles;
}
