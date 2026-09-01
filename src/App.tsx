import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  ActiveTab 
} from './components/Navbar';
import { ServerBlueprintView } from './components/ServerBlueprintView';
import { AiPlaygroundView } from './components/AiPlaygroundView';
import { RolesManagerView } from './components/RolesManagerView';
import { CommandsManagerView } from './components/CommandsManagerView';
import { BotGuideView } from './components/BotGuideView';
import { VercelDeploymentGuideView } from './components/VercelDeploymentGuideView';
import { CodeExporterView } from './components/CodeExporterView';
import { 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Terminal, 
  Bot, 
  Layers, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('blueprint');
  const [envStatus, setEnvStatus] = useState<{
    hasGeminiKey: boolean;
    hasDiscordToken: boolean;
    hasPublicKey: boolean;
    hasAppId: boolean;
    hasGuildId: boolean;
    appId: string | null;
    guildId: string | null;
  }>({
    hasGeminiKey: true,
    hasDiscordToken: false,
    hasPublicKey: false,
    hasAppId: false,
    hasGuildId: false,
    appId: null,
    guildId: null,
  });

  const [isExecutingSetup, setIsExecutingSetup] = useState(false);
  const [isExecutingRoles, setIsExecutingRoles] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [setupLogs, setSetupLogs] = useState<string[]>([]);
  const [rolesLogs, setRolesLogs] = useState<string[]>([]);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Fetch initial health & configuration status
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.envStatus) {
          setEnvStatus(data.envStatus);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch health info:', err);
      });
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handler: Execute Server Setup (/setup-server)
  const handleExecuteSetup = async (customGuildId?: string) => {
    setIsExecutingSetup(true);
    const targetGuild = customGuildId || envStatus.guildId;

    try {
      const response = await fetch('/api/discord/setup-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: targetGuild }),
      });

      const data = await response.json();
      if (data.success) {
        setSetupLogs(data.logs || []);
        showNotification(
          'success',
          '🎉 Berhasil membuat semua kategori & channel untuk "The Boomers"!'
        );
      } else {
        // Simulation feedback if token not set yet
        setSetupLogs([
          '[INFO] Simulasi Setup Server The Boomers dijalankan...',
          '[SUCCESS] Category 📌 ━ INFORMATION siap dibuat (#announcements, #rules, #welcome)',
          '[SUCCESS] Category 💬 ━ GENERAL CHAT siap dibuat (#chat-santai, #bot-commands, #media-memes)',
          '[SUCCESS] Category 🎮 ━ GAMING ZONE siap dibuat (#gaming-chat, #loblox-chat, Duo 1, Squad Room, Loblox Room)',
          '[SUCCESS] Category 🎙️ ━ VOICE LOUNGE siap dibuat (Chill Lounge, Music Room, AFK Room)',
          `[NOTE] ${data.error || 'Untuk eksekusi langsung ke live server Discord, pastikan DISCORD_TOKEN diisi di .env!'}`,
        ]);
        showNotification('info', data.error || 'Simulasi berhasil dijalankan!');
      }
    } catch (err: any) {
      setSetupLogs([`[ERROR] Gagal menghubungi backend: ${err.message}`]);
      showNotification('error', 'Gagal eksekusi: ' + err.message);
    } finally {
      setIsExecutingSetup(false);
    }
  };

  // Handler: Execute Roles Setup (/setup-roles)
  const handleExecuteRoles = async (customGuildId?: string) => {
    setIsExecutingRoles(true);
    const targetGuild = customGuildId || envStatus.guildId;

    try {
      const response = await fetch('/api/discord/setup-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: targetGuild }),
      });

      const data = await response.json();
      if (data.success) {
        setRolesLogs(data.logs || []);
        showNotification('success', '👑 Hierarki role The Boomers berhasil dibuat di Discord!');
      } else {
        setRolesLogs([
          '[INFO] Simulasi Hierarki Role The Boomers:',
          '[SUCCESS] 👑 ━ Server Architect (#FFD700) - Administrator',
          '[SUCCESS] 🛡️ ━ Administrator (#E74C3C) - Admin',
          '[SUCCESS] ⚔️ ━ Moderator (#3498DB) - Mod Perms',
          '[SUCCESS] 🌟 ━ VIP Boomer (#F1C40F)',
          '[SUCCESS] 🎮 ━ Gamer (#9B59B6)',
          '[SUCCESS] 🤖 ━ Bots (#607D8B)',
          '[SUCCESS] 👥 ━ Member (#2ECC71)',
          `[NOTE] ${data.error || 'Konfigurasikan DISCORD_TOKEN di .env untuk eksekusi langsung.'}`,
        ]);
        showNotification('info', data.error || 'Hierarki role siap diaplikasikan!');
      }
    } catch (err: any) {
      showNotification('error', 'Error: ' + err.message);
    } finally {
      setIsExecutingRoles(false);
    }
  };

  // Handler: Register Slash Commands
  const handleRegisterCommands = async (targetGuildId?: string) => {
    setIsRegistering(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: targetGuildId || envStatus.guildId,
        }),
      });

      const data = await response.json();
      setRegistrationResult(data);

      if (data.success) {
        showNotification('success', '⚡ ' + data.message);
      } else {
        showNotification(
          'info',
          'Pastikan DISCORD_TOKEN dan DISCORD_APPLICATION_ID terisi di .env untuk registrasi otomatis!'
        );
      }
    } catch (err: any) {
      showNotification('error', 'Gagal registrasi: ' + err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans antialiased selection:bg-[#5865f2] selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-12 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-2xl border flex items-center gap-3 max-w-md ${
              notification.type === 'success'
                ? 'bg-[#0f172a] border-emerald-500/40 text-emerald-300 shadow-emerald-950/40'
                : notification.type === 'error'
                ? 'bg-[#0f172a] border-red-500/40 text-red-300 shadow-red-950/40'
                : 'bg-[#0f172a] border-blue-500/40 text-blue-300 shadow-blue-950/40'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : notification.type === 'error' ? (
              <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
            <span className="text-xs font-mono font-medium leading-snug">
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        envStatus={envStatus}
        onQuickRegister={() => handleRegisterCommands(envStatus.guildId || undefined)}
        isRegistering={isRegistering}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'blueprint' && (
          <ServerBlueprintView
            onExecuteSetup={handleExecuteSetup}
            isExecuting={isExecutingSetup}
            setupLogs={setupLogs}
            hasDiscordToken={envStatus.hasDiscordToken}
            configuredGuildId={envStatus.guildId}
          />
        )}

        {activeTab === 'ai' && (
          <AiPlaygroundView hasGeminiKey={envStatus.hasGeminiKey} />
        )}

        {activeTab === 'roles' && (
          <RolesManagerView
            onExecuteRoles={handleExecuteRoles}
            isExecuting={isExecutingRoles}
            setupLogs={rolesLogs}
            configuredGuildId={envStatus.guildId}
          />
        )}

        {activeTab === 'commands' && (
          <CommandsManagerView
            onRegisterCommands={handleRegisterCommands}
            isRegistering={isRegistering}
            configuredGuildId={envStatus.guildId}
            registrationResult={registrationResult}
          />
        )}

        {activeTab === 'bots' && <BotGuideView />}

        {activeTab === 'deployment' && (
          <VercelDeploymentGuideView
            appId={envStatus.appId}
            guildId={envStatus.guildId}
          />
        )}

        {activeTab === 'code' && <CodeExporterView />}
      </main>

      {/* Geometric Balance Console Footer */}
      <footer className="h-9 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between px-4 sm:px-8 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Session: 9284-AX-ARCHITECT</span>
        </div>
        <div className="hidden sm:block">
          System Ready // Discord REST & Gemini AI Synchronized
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Cloud: Vercel Serverless</span>
          <span className="text-emerald-500">● 12ms</span>
        </div>
      </footer>
    </div>
  );
}
