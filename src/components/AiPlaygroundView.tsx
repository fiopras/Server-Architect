import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  RefreshCw, 
  Lightbulb, 
  MessageSquare,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface AiPlaygroundViewProps {
  hasGeminiKey: boolean;
}

export const AiPlaygroundView: React.FC<AiPlaygroundViewProps> = ({ hasGeminiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [userName, setUserName] = useState('BoomersAdmin');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    prompt: string;
    answer: string;
    timestamp: string;
    userName: string;
    charCount: number;
  }>>([
    {
      id: 'default-1',
      prompt: 'Buatkan aturan server singkat tapi tegas untuk komunitas The Boomers',
      answer: `📜 **PERATURAN RESMI SERVER THE BOOMERS**

1. **Saling Menghormati**: Dilarang melakukan toxic berlebihan, SARA, harassment, dan ujaran kebencian.
2. **Kesesuaian Channel**: Kirim pesan, bot command, dan meme sesuai channel masing-masing (\`#💭・chat-santai\`, \`#🤖・bot-commands\`, \`#📷・media-memes\`).
3. **No Spam & Self-Promo**: Dilarang spam chat/tag sembarangan dan promosi tanpa izin admin.
4. **Voice Channel Etiquette**: Jangan ear-rape atau menyalakan mic saat noise mengganggu di \`#☕・Chill Lounge\`.
5. **Keputusan Admin Final**: Hormati keputusan moderator & admin untuk menjaga kenyamanan bersama.

*Selamat bersenang-senang dan selamat bergabung di The Boomers! 🎉*`,
      timestamp: 'Hari ini pukul 12:00',
      userName: 'BoomersAdmin',
      charCount: 680,
    }
  ]);

  const quickPrompts = [
    {
      label: '📜 Peraturan Server',
      text: 'Buatkan daftar aturan (rules) lengkap dan rapi dengan format markdown Discord untuk server The Boomers.',
    },
    {
      label: '🎮 Event Mabar Roblox/Loblox',
      text: 'Buatkan pengumuman seru untuk event mabar Roblox / Loblox malam minggu di channel 📢・announcements.',
    },
    {
      label: '👋 Pesan Welcome Member',
      text: 'Buat pesan sambutan hangat dan ramah bagi member baru yang baru saja masuk ke server The Boomers.',
    },
    {
      label: '🛡️ Tips Moderasi Komunitas',
      text: 'Bagikan 5 tips penting untuk moderator dalam menjaga kenyamanan voice channel dan obrolan gaming.',
    },
  ];

  const handleAsk = async (promptToUse?: string) => {
    const query = promptToUse || prompt;
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, userName }),
      });

      const data = await response.json();
      if (data.success && data.answer) {
        const newEntry = {
          id: Date.now().toString(),
          prompt: query,
          answer: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userName,
          charCount: data.answer.length,
        };
        setChatHistory([newEntry, ...chatHistory]);
        if (!promptToUse) setPrompt('');
      } else {
        alert('Gagal menghasilkan jawaban: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>// Model: Gemini 3.7 Flash Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Discord Assistant Playground (/ask)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Uji coba respons AI cerdas yang dihasilkan bot saat member menjalankan perintah{' '}
              <code className="text-blue-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">/ask &lt;prompt&gt;</code> di Discord.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#020617] border border-slate-800 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Auto DeferReply (Anti-Timeout)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#020617] border border-slate-800 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Max 2000 Char Guard</span>
            </span>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Preset Prompt Queries:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(qp.text);
                  handleAsk(qp.text);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 rounded bg-[#020617] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-lg p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 sm:w-48 bg-[#020617] border border-slate-700 rounded px-3 py-2">
            <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Username..."
              className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ketik pertanyaan atau perintah untuk /ask (e.g. Ide mabar weekend)..."
              className="w-full bg-[#020617] border border-slate-700 rounded px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-24 font-mono"
            />
            <button
              id="btn-send-ask"
              onClick={() => handleAsk()}
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-40"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Kirim</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Discord Message Feed Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono px-1">
          <span>// Live Interaction Feed Preview</span>
          <span>{chatHistory.length} Simulasi</span>
        </div>

        {chatHistory.map((item) => (
          <div
            key={item.id}
            className="bg-[#0f172a] border border-slate-800 rounded-lg p-4 sm:p-5 shadow-lg space-y-3"
          >
            {/* User Command Invocation */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-blue-400 font-semibold">/{item.userName}</span>
              <span className="text-slate-500">invoked</span>
              <span className="bg-[#020617] border border-slate-800 px-2 py-0.5 rounded text-slate-200 text-[11px]">
                /ask prompt: "{item.prompt}"
              </span>
            </div>

            {/* Discord Bot Reply Card */}
            <div className="flex items-start gap-3 pt-2">
              <div className="w-8 h-8 rounded bg-[#5865f2] flex items-center justify-center text-white flex-shrink-0 shadow">
                <Bot className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white font-mono">Server Architect</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#5865f2] text-white text-[9px] font-bold uppercase tracking-wider">
                    BOT
                  </span>
                  <span className="text-xs font-mono text-slate-500">{item.timestamp}</span>
                </div>

                {/* Discord Embed Box */}
                <div className="border-l-4 border-blue-500 bg-[#020617] border-y border-r border-slate-800/80 rounded-r p-4 mt-2 shadow-inner">
                  <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 mb-2 font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI: "{item.prompt}"</span>
                  </div>

                  {/* Body Text */}
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {item.answer}
                  </div>

                  {/* Embed Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                      ⚡ Server Architect • Google Gemini 3.7 Flash
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono ${item.charCount > 1900 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                        {item.charCount} / 2000 chars
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.answer)}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer font-mono text-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Markdown</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
