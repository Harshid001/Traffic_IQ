import { useState, useEffect, useRef, useCallback } from 'react';
import { getQuickPrompts, greeting } from '../data';
import {
  askAiCopilot,
  checkAiConnectionStatus,
  getCustomApiUrl,
  setCustomApiUrl
} from '../services/aiCopilotService';

export default function CopilotWidget({
  corridor,
  showProvenance = true,
  heightClass = 'h-[280px]',
  telemetry = {}
}) {
  const [messages, setMessages] = useState(() => [
    {
      id: 'init',
      sender: 'copilot',
      text: greeting(corridor),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provenance: 'TELEMETRY ENGINE'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [showRerouteAlert, setShowRerouteAlert] = useState(true);
  const [aiStatus, setAiStatus] = useState({
    online: false,
    label: 'Checking AI status...',
    type: 'checking'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(() => getCustomApiUrl());

  const messagesEndRef = useRef(null);
  const prevCorridorId = useRef(corridor.id);

  // Probe AI Status on mount and periodically
  const probeStatus = useCallback(async () => {
    const status = await checkAiConnectionStatus();
    setAiStatus(status);
  }, []);

  useEffect(() => {
    probeStatus();
    const interval = setInterval(probeStatus, 12000);
    return () => clearInterval(interval);
  }, [probeStatus]);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // When corridor changes, add an info notice and greeting
  useEffect(() => {
    if (prevCorridorId.current !== corridor.id) {
      prevCorridorId.current = corridor.id;
      setShowRerouteAlert(true);
      setMessages((prev) => [
        ...prev,
        {
          id: 'switch-' + Date.now(),
          sender: 'system',
          text: `Switched corridor to: ${corridor.name} (${corridor.city})`
        },
        {
          id: 'greeting-' + Date.now(),
          sender: 'copilot',
          text: greeting(corridor),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provenance: 'TELEMETRY ENGINE'
        }
      ]);
    }
  }, [corridor]);

  // Voice narration helper
  const speakText = (text) => {
    if (!voiceActive || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`🚨⚠️⭐💳🕒🚗💡•]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Ignore speech synthesis errors
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const result = await askAiCopilot({
        query,
        corridor,
        telemetry,
        history: [...messages, userMsg]
      });

      const copilotMsg = {
        id: 'c-' + Date.now(),
        sender: 'copilot',
        text: result.text,
        provenance: result.provenance,
        model: result.model,
        isError: !result.success,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);

      if (result.success) {
        speakText(result.text);
        if (!aiStatus.online) {
          probeStatus();
        }
      }
    } catch (err) {
      const errorMsg = {
        id: 'c-err-' + Date.now(),
        sender: 'copilot',
        text: '⚠️ An unexpected error occurred while communicating with the local AI model. Please verify your launcher is running.',
        provenance: 'ERROR',
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  const handleAcceptReroute = () => {
    setShowRerouteAlert(false);
    handleSend('Why did you recommend this reroute and what is the exact delay breakdown?');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveCustomUrl = (e) => {
    e.preventDefault();
    setCustomApiUrl(customUrlInput);
    setShowSettings(false);
    probeStatus();
  };

  return (
    <div className="rounded-3xl border border-primary/40 overflow-hidden bg-card shadow-glow transition-all flex flex-col relative">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-surface/90 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-sm">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-slate-100 block leading-tight">
                AI Copilot
              </span>
              {/* Live Connection Status Badge */}
              <span
                className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  aiStatus.online
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
                title={aiStatus.url ? `Connected to ${aiStatus.url}` : 'Run start_all.bat on PC to connect local model'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    aiStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {aiStatus.online ? 'Phi-4-mini (Connected)' : 'Local AI (Waiting)'}
              </span>
            </div>
            <span className="text-[0.6rem] text-slate-400">
              Live Grounded Telemetry · Zero Hallucination
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => probeStatus()}
            title="Refresh AI Connection Status"
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 text-[0.7rem] transition-colors"
          >
            🔄
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            title="Configure Local / Remote Tunnel URL"
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 text-[0.7rem] transition-colors"
          >
            ⚙️
          </button>
          <button
            type="button"
            onClick={() => setVoiceActive((prev) => !prev)}
            className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold border transition-all cursor-pointer ${
              voiceActive
                ? 'bg-primary text-ink border-primary shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
            }`}
          >
            {voiceActive ? '🔊 Voice On' : '🔈 Muted'}
          </button>
        </div>
      </div>

      {/* Settings / Tunnel URL Drawer */}
      {showSettings && (
        <form
          onSubmit={handleSaveCustomUrl}
          className="bg-surface/95 border-b border-white/10 p-3 text-xs flex flex-col gap-2 animate-fadeUp z-10"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Local AI & Remote Tunnel Connection:</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-400 text-[0.7rem]">
            Leave blank for auto-discovery (<code>http://localhost:8005</code> or <code>http://localhost:11434</code>), or enter your secure tunnel URL (e.g. <code>https://your-tunnel.loca.lt</code>).
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="e.g. http://localhost:8005 or https://xyz.loca.lt"
              className="flex-1 bg-ink border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus-visible:border-primary outline-none"
            />
            <button
              type="submit"
              className="btn btn-primary px-3 py-1.5 text-xs rounded-lg font-semibold"
            >
              Save & Test
            </button>
          </div>
        </form>
      )}

      {/* Proactive Reroute Live Banner */}
      {showRerouteAlert && corridor.incident && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3 text-xs animate-fadeUp">
          <div className="flex items-center gap-2 text-amber-200">
            <span className="text-base">🚨</span>
            <span>
              <strong>Alert:</strong> {corridor.incident.type} — {corridor.incident.delay} delay on {corridor.fastest}.
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleAcceptReroute}
              className="bg-amber-400 hover:bg-amber-300 text-ink font-bold px-3 py-1 rounded-lg text-[0.7rem] transition-colors cursor-pointer"
            >
              Why? →
            </button>
            <button
              onClick={() => setShowRerouteAlert(false)}
              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Copilot conversation"
        className={`p-4 ${heightClass} overflow-y-auto flex flex-col gap-3 bg-ink/95 scroll-smooth copilot-scroll`}
      >
        {messages.map((m) => {
          if (m.sender === 'system') {
            return (
              <div key={m.id} className="text-center my-1.5">
                <span className="text-[0.65rem] uppercase tracking-wider text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {m.text}
                </span>
              </div>
            );
          }
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 max-w-[92%] ${
                isUser ? 'self-end flex-row-reverse' : 'self-start'
              } animate-fadeUp`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                  isUser
                    ? 'bg-primary/20 border border-primary/30'
                    : m.isError
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {isUser ? '👤' : m.isError ? '⚠️' : '🤖'}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-primary text-ink font-medium rounded-br-md shadow-md'
                      : m.isError
                      ? 'bg-amber-500/10 border border-amber-500/30 text-slate-100 rounded-bl-md'
                      : 'bg-surface border border-white/10 text-slate-100 rounded-bl-md shadow-sm'
                  }`}
                >
                  {m.text}
                </div>

                {/* Provenance & Timestamp Metadata */}
                <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {m.provenance && !isUser && (
                    <span className="text-[0.6rem] font-bold text-primary-bright bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded">
                      {m.provenance}
                    </span>
                  )}
                  {m.time && (
                    <span className="text-[0.6rem] text-slate-500">
                      {m.time}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator with bouncing dots */}
        {isTyping && (
          <div className="self-start flex gap-2.5 animate-fadeUp">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs bg-white/5 border border-white/10">
              🤖
            </div>
            <div className="bg-surface border border-white/10 text-slate-400 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-dot-3" />
              <span className="ml-1.5 text-xs text-slate-300 font-medium">
                Reasoning via Phi-4-mini...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-1.5 flex-wrap px-4 py-2 border-t border-white/10 bg-surface/80">
        <span className="text-[0.7rem] text-slate-400 self-center font-medium mr-1 hidden sm:inline">
          Live Prompts:
        </span>
        {getQuickPrompts().map((p) => (
          <button
            key={p.label}
            onClick={() => handleSend(p.query)}
            type="button"
            className="prompt-pill"
            aria-label={`Ask: ${p.label}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-white/10 bg-surface flex gap-2 items-center">
        <label htmlFor={`copilot-input-${corridor.id}`} className="sr-only">
          Type your question for TrafficIQ Copilot
        </label>
        <input
          id={`copilot-input-${corridor.id}`}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about routes, delays, tolls, or leave timings..."
          className="flex-1 bg-ink border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary outline-none transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
          type="button"
          aria-label="Send message"
          className="btn btn-primary px-4 py-2.5 text-xs rounded-xl disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none transition-all font-semibold gap-1.5 cursor-pointer"
        >
          Send
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
