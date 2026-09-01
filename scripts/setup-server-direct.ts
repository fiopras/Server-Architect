/**
 * CLI Script: Direct Server Architecture Builder for "The Boomers"
 * Creates categories and channels directly via Discord REST API.
 * Usage:
 *   npx tsx scripts/setup-server-direct.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { BOOMERS_SERVER_TEMPLATE, BOOMERS_ROLES_TEMPLATE } from '../src/data/discordTemplates.js';
import { executeSetupServer, executeSetupRoles } from '../src/services/discordApi.js';

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const guildId = process.env.GUILD_ID;

  console.log('🏛️ ===================================================');
  console.log('   The Boomers - Direct Server Architect Setup Tool   ');
  console.log('======================================================\n');

  if (!token || !guildId) {
    console.error('❌ Error: Missing DISCORD_TOKEN or GUILD_ID in .env file.');
    process.exit(1);
  }

  console.log(`🏠 Setting up Discord Guild: ${guildId}\n`);

  console.log('📦 Step 1: Building Hierarchical Roles...');
  const roles = await executeSetupRoles(token, guildId, (e) => {
    console.log(`   [Role] ${e.message}`);
  });
  console.log(`   ✅ Finished building ${roles.length} roles.\n`);

  console.log('📁 Step 2: Building Categories and Channels for "The Boomers"...');
  const summary = await executeSetupServer(token, guildId, (e) => {
    console.log(`   [Channel] ${e.message}`);
  });

  console.log('\n🎉 Server Architecture Completed Successfully!');
  summary.forEach((s) => {
    console.log(`   📌 Category: ${s.category}`);
    s.channels.forEach((ch) => console.log(`      └─ #${ch}`));
  });
}

main().catch((err) => {
  console.error('Fatal error during setup:', err);
  process.exit(1);
});
