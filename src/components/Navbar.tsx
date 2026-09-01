import React from 'react';
import { 
  Bot, 
  Sparkles, 
  Layers, 
  Terminal, 
  ShieldAlert, 
  Rocket, 
  FileCode2, 
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type ActiveTab = 'blueprint' | 'ai' | 'roles' | 'commands' | 'bots' | 'deployment' | 'code';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  envStatus: {
    hasGeminiKey: boolean;
    hasDiscordToken: boolean;
    hasPublicKey: boolean;
    hasAppId: boolean;
    hasGuildId: boolean;
  };
  onQuickRegister: () => void;
  isRegistering: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  envStatus,
  onQuickRegister,
  isRegistering,
}) => {
  const isFullyConfigured =
    envStatus.hasGeminiKey &&
    envStatus.hasDiscordToken &&
    envStatus.hasPublicKey &&
    envStatus.hasAppId;

  return (
    <header className="border-b border-slate-800 bg-[#0f172a] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Bot Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#5865f2] rounded flex items-center justify-center shadow-lg shadow-blue-900/20 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                Project Console
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-white tracking-tight">
                  Server Architect
                </span>
                <span className="text-xs text-slate-500 font-mono">/</span>
                <span className="text-xs font-mono text-slate-300">The Boomers</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Status Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Live: Vercel Serverless
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
                Gemini 3.7 Flash
              </span>
            </div>

            <button
              id="btn-quick-register"
              onClick={onQuickRegister}
              disabled={isRegistering}
              className="inline-flex items-center px-3 py-1.5 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold shadow-lg shadow-blue-900/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5" />
              <span>{isRegistering ? 'Registering...' : 'Register Commands'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-800">
          <button
            id="tab-blueprint"
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'blueprint'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server Blueprint</span>
          </button>

          <button
            id="tab-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Assistant (/ask)</span>
          </button>

          <button
            id="tab-roles"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Roles & Hierarchy</span>
          </button>

          <button
            id="tab-commands"
            onClick={() => setActiveTab('commands')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'commands'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Slash Commands</span>
          </button>

          <button
            id="tab-bots"
            onClick={() => setActiveTab('bots')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'bots'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Companion Bots</span>
          </button>

          <button
            id="tab-deployment"
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'deployment'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-purple-400" />
            <span>Vercel & Portal Setup</span>
          </button>

          <button
            id="tab-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
