export interface DiscordChannelTemplate {
  name: string;
  type: 0 | 2 | 4 | 5; // 0 = GUILD_TEXT, 2 = GUILD_VOICE, 4 = GUILD_CATEGORY, 5 = GUILD_ANNOUNCEMENT
  topic?: string;
  user_limit?: number;
  nsfw?: boolean;
  rate_limit_per_user?: number;
  readOnly?: boolean;
}

export interface DiscordCategoryTemplate {
  name: string;
  channels: DiscordChannelTemplate[];
}

export interface DiscordRoleTemplate {
  name: string;
  color: number; // Hex color integer
  hoist: boolean; // Display separately
  mentionable: boolean;
  permissions: string; // Bitfield string
  description?: string;
}

export interface BotGuideItem {
  name: string;
  tagline: string;
  purpose: string;
  inviteUrl: string;
  avatarUrl: string;
  features: string[];
  recommendedChannel: string;
  setupCommands: string[];
}

export interface SlashCommandDefinition {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    type: number; // 3 = STRING, 4 = INTEGER, 5 = BOOLEAN, etc.
    required?: boolean;
    choices?: Array<{ name: string; value: string | number }>;
  }>;
  default_member_permissions?: string; // e.g. "8" for Administrator
  dm_permission?: boolean;
}
