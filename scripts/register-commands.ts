/**
 * CLI Script: Register Slash Commands to Discord Guild or Globally
 * Usage:
 *   npx tsx scripts/register-commands.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { SLASH_COMMANDS } from '../src/data/discordTemplates.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const appId = process.env.DISCORD_APPLICATION_ID;
  const guildId = process.env.GUILD_ID;

  console.log('🤖 ===================================================');
  console.log('   Server Architect - Discord Slash Commands Register   ');
  console.log('======================================================\n');

  if (!token || !appId) {
    console.error('❌ Error: Missing DISCORD_TOKEN or DISCORD_APPLICATION_ID in .env file.');
    console.error('Please configure your .env file before running this script.');
    process.exit(1);
  }

  console.log(`🔑 Application ID : ${appId}`);
  console.log(`🏠 Target Guild ID : ${guildId ? guildId + ' (Instant update)' : 'Global (Takes ~1 hour)'}`);
  console.log(`📋 Commands to register: ${SLASH_COMMANDS.map((c) => '/' + c.name).join(', ')}\n`);

  const url = guildId
    ? `${DISCORD_API_BASE}/applications/${appId}/guilds/${guildId}/commands`
    : `${DISCORD_API_BASE}/applications/${appId}/commands`;

  try {
    console.log('⏳ Sending registration request to Discord REST API...');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(SLASH_COMMANDS),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Discord API rejected registration (${response.status}):\n${errorText}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log(`\n🎉 Success! Successfully registered ${data.length} slash commands:`);
    data.forEach((cmd: any) => {
      console.log(`   ✅ /${cmd.name} (ID: ${cmd.id}) - ${cmd.description}`);
    });

    console.log('\n💡 Next step: Deploy to Vercel and paste your interactions endpoint URL into Discord Developer Portal!');
  } catch (error: any) {
    console.error('❌ Network error during registration:', error.message);
    process.exit(1);
  }
}

main();
