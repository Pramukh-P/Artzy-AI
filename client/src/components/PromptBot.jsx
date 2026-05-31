import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiFetch from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { usePromptBot } from '../context/PromptBotContext';
import { useNavigate } from 'react-router-dom';

// Speech bubbles that pop up periodically
const SPEECH_BUBBLES = [
  "Need prompt help? 🎨",
  "Turn your idea into art! ✨",
  "Stuck on ideas? Chat with me!",
  "I'll craft the perfect prompt!",
  "Save your credits with a good prompt 🖌️",
  "Describe anything, I'll polish it!",
];

// Initial bot greeting
const INITIAL_MSG = {
  role: 'bot',
  content: "Hi! I'm Artzy Bot 🤖🎨\n\nTell me your idea in any language — even a rough one! I'll ask a few questions if needed, then craft you a perfect AI art prompt.\n\n*Try: \"a dragon in a forest\" or \"something futuristic and colorful\"*",
  hasPrompt: false,
  prompt: null,
  id: 'init',
};

const TypingIndicator = () => (
  <div style={{
    display: 'flex', gap: 5, alignItems: 'center', padding: '10px 14px',
    background: 'rgba(100,105,255,.12)', borderRadius: '16px 16px 16px 4px',
    width: 'fit-content', maxWidth: 80
  }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#8B5CF6', display: 'block',
        animation: `typingBounce .8s ease-in-out ${i * .2}s infinite`,
      }} />
    ))}
  </div>
);

// Mini robot SVG for floating widget
const RobotAvatar = ({ size = 52, celebrating = false }) => (
  <svg viewBox="0 0 80 90" style={{ width: size, height: 'auto' }}>
    <defs>
      <linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F9FAFB" />
        <stop offset="100%" stopColor="#E5E7EB" />
      </linearGradient>
      <linearGradient id="brushG2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    {/* Body */}
    <rect x="16" y="46" width="48" height="38" rx="13" fill="url(#bodyG)" />
    {/* Body detail */}
    <circle cx="28" cy="58" r="3" fill="#D1D5DB" />
    <circle cx="40" cy="58" r="3" fill="#D1D5DB" />
    <circle cx="52" cy="58" r="3" fill="#D1D5DB" />
    <rect x="20" y="68" width="40" height="5" rx="2.5" fill="rgba(139,92,246,.2)" />
    {/* Arms */}
    <rect x="2" y="50" width="14" height="8" rx="4" fill="#E5E7EB" />
    <rect x="64" y="50" width="14" height="8" rx="4" fill="#E5E7EB" />
    {/* Brush in right hand */}
    <rect x="77" y="34" width="4" height="24" rx="2" fill="#8B5CF6" />
    <ellipse cx="79" cy="32" rx="6" ry="4.5" fill="url(#brushG2)" />
    <ellipse cx="79" cy="29" rx="4" ry="3" fill="#FBBF24" />
    {/* Neck */}
    <rect x="31" y="34" width="18" height="14" rx="4" fill="#E5E7EB" />
    {/* Head */}
    <rect x="8" y="0" width="64" height="38" rx="18" fill="url(#bodyG)" />
    {/* Left eye */}
    <circle cx="27" cy="16" r="10" fill="#1E40AF" />
    <circle cx="27" cy="16" r="7" fill="#3B82F6" />
    <circle cx="27" cy="16" r="4" fill="#0F172A" />
    <circle cx="29" cy="14" r="2.5" fill="white" />
    {/* Right eye - winking */}
    <path d="M42 16 Q49 11 56 16" stroke="#1E40AF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M43 17 Q49 13 55 17" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Smile */}
    <path d="M24 28 Q33 35 44 28" stroke="#6B7280" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Antenna */}
    <rect x="37" y="-14" width="6" height="16" rx="3" fill="#8B5CF6" />
    <circle cx="40" cy="-17" r="7" fill="#7C3AED" />
    <circle cx="40" cy="-17" r="4" fill="#A78BFA" />
    {/* Legs */}
    <rect x="22" y="84" width="13" height="6" rx="3" fill="#D1D5DB" />
    <rect x="45" y="84" width="13" height="6" rx="3" fill="#D1D5DB" />
  </svg>
);

const PromptBot = ({ onUsePrompt }) => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    messages,
    setMessages,
    clearChat
  } = usePromptBot();
  const [isOpen, setIsOpen] = useState(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState(null);
  const [bubble, setBubble] = useState(null);
  const bubbleIndexRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Periodic speech bubble
  useEffect(() => {
    if (isOpen) return;

    const show = () => {
      setBubble(
        SPEECH_BUBBLES[
        bubbleIndexRef.current % SPEECH_BUBBLES.length
        ]
      );

      bubbleIndexRef.current += 1;

      setTimeout(() => {
        setBubble(null);
      }, 4000);
    };

    show();

    const interval = setInterval(show, 14000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed, id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build API messages (exclude initial bot msg, only include conversation)
      const apiMessages = newMessages
        .filter(m => m.id !== 'init')
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));

      const data = await apiFetch('/prompt-bot', {
        method: 'POST',
        body: JSON.stringify({ messages: apiMessages }),
      }, token);

      setMessages(prev => [...prev, {
        role: 'bot',
        content: data.message,
        hasPrompt: data.hasPrompt,
        prompt: data.prompt,
        id: Date.now() + 1,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: "Oops, I'm having a moment 😅 Please try again!",
        hasPrompt: false,
        prompt: null,
        id: Date.now() + 1,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, token]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    clearChat();
    setInput('');
  };

  const handleCopyPrompt = async (prompt, messageId) => {
    try {
      await navigator.clipboard.writeText(prompt);

      setCopiedPromptId(messageId);

      setTimeout(() => {
        setCopiedPromptId(null);
      }, 2000);

    } catch (error) {
      console.error("Copy failed:", error);
    }
  };
  const panelWidth = isMobile ? '100vw' : 380;
  const panelHeight = isMobile ? '90vh' : 520;

  return (
    <>
      <style>{`
        @keyframes botFloat {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
        @keyframes botWave {
          0%,100%{transform:rotate(0deg)}
          20%{transform:rotate(-15deg)}
          40%{transform:rotate(15deg)}
          60%{transform:rotate(-10deg)}
          80%{transform:rotate(10deg)}
        }
        @keyframes bubbleIn {
          0%{transform:scale(0) translateY(10px);opacity:0}
          60%{transform:scale(1.05) translateY(-2px);opacity:1}
          100%{transform:scale(1) translateY(0);opacity:1}
        }
        @keyframes bubbleOut {
          0%{transform:scale(1);opacity:1}
          100%{transform:scale(.8) translateY(-10px);opacity:0}
        }
        @keyframes typingBounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-8px)}
        }
        @keyframes slideUp {
          0%{transform:translateY(20px);opacity:0}
          100%{transform:translateY(0);opacity:1}
        }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(100,105,255,.4)}
          50%{box-shadow:0 0 0 10px rgba(100,105,255,0)}
        }
        .bot-float { animation: botFloat 3s ease-in-out infinite; }
        .bot-wave { animation: botWave .8s ease-in-out; }
        .bubble-in { animation: bubbleIn .35s cubic-bezier(.34,1.56,.64,1) forwards; }
        .slide-up { animation: slideUp .3s ease-out forwards; }
        .glow-pulse { animation: glowPulse 2s ease-in-out infinite; }
        .promptbot-input:focus { outline: none; }
        .promptbot-scroll::-webkit-scrollbar { width: 4px; }
        .promptbot-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,.3); border-radius: 2px; }
        .msg-bot { animation: slideUp .25s ease-out forwards; }
        .msg-user { animation: slideUp .2s ease-out forwards; }
      `}</style>

      {/* ── FLOATING ROBOT WIDGET ── */}
      <div style={{
        position: 'fixed', bottom: 20, right: 24, zIndex: 1000,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
      }}>
        {/* Speech bubble */}
        {bubble && !isOpen && (
          <div className="bubble-in" style={{
            background: 'white', color: '#374151', borderRadius: '12px 12px 4px 12px',
            padding: '8px 12px', maxWidth: 180, fontSize: 12.5, fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,.15)', lineHeight: 1.4,
            border: '1px solid rgba(100,105,255,.2)',
          }}>
            {bubble}
            {/* Tail */}
            <div style={{
              position: 'absolute', bottom: -8, right: 16,
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '0px solid transparent',
              borderTop: '8px solid white',
            }} />
          </div>
        )}

        {/* Robot button */}
        <button
          onClick={() => setIsOpen(o => !o)}
          className={`${!isOpen ? 'bot-float glow-pulse' : ''}`}
          style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
            border: '3px solid rgba(255,255,255,.3)',
            boxShadow: '0 8px 32px rgba(100,105,255,.5)',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'visible',
            transition: 'transform .2s',
          }}
          title="Open Artzy Bot"
        >
          <div style={{ transform: 'scale(.85)', marginTop: 4 }}>
            <RobotAvatar size={52} />
          </div>
          {/* Notification dot */}
          {!isOpen && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 14, height: 14, borderRadius: '50%',
              background: '#EC4899', border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 800, color: 'white',
            }}>✨</span>
          )}
        </button>
      </div>

      {/* ── CHAT PANEL ── */}
      {isOpen && (
        <div
          className="slide-up"
          style={{
            position: 'fixed',
            bottom: isMobile ? 0 : 72,
            right: isMobile ? 0 : 24,
            width: panelWidth,
            height: panelHeight,
            display: 'flex', flexDirection: 'column',
            borderRadius: isMobile ? '20px 20px 0 0' : 20,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,.4)',
            zIndex: 999,
            background: 'var(--chat-bg, #ffffff)',
          }}
        >
          <style>{`
            @media (prefers-color-scheme: dark) { :root { --chat-bg: #1f2937; } }
            .dark { --chat-bg: #1f2937; }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
            }}>
              <RobotAvatar size={36} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'white' }}>Artzy Bot</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.7)' }}>
                {loading ? '✍️ Crafting your prompt...' : '🟢 Online — Ask me anything'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleReset}
                disabled={!isAuthenticated} title="New chat"
                style={{
                  background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8,
                  padding: '6px 8px', color: 'white', cursor: 'pointer', fontSize: 13
                }}>
                🔄
              </button>
              <button onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8,
                  padding: '6px 10px', color: 'white', cursor: 'pointer', fontSize: 16
                }}>
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="promptbot-scroll" style={{
            flex: 1, overflowY: 'auto', padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 10,
            background: '#f9fafe',
          }}
          // dark mode handled via CSS variable
          >
            {!isAuthenticated ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 24,
                  minHeight: '100%',
                }}
              >
                <div style={{ fontSize: 60 }}>🔒</div>

                <h3
                  style={{
                    marginTop: 12,
                    marginBottom: 10,
                    color: '#374151',
                  }}
                >
                  Login Required
                </h3>

                <p
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  Sign in to use Artzy Bot,
                  generate prompts,
                  save conversations,
                  and create AI artwork.
                </p>

                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background:
                      'linear-gradient(135deg,#6469ff,#8B5CF6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Login
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={msg.role === 'bot' ? 'msg-bot' : 'msg-user'}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: msg.role === 'bot' ? 'flex-start' : 'flex-end'
                    }}>

                    {msg.role === 'bot' && (
                      <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end', maxWidth: '90%' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: 14 }}>🤖</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {/* Message text */}
                          <div style={{
                            background: 'white', borderRadius: '16px 16px 16px 4px',
                            padding: '10px 14px', boxShadow: '0 1px 4px rgba(0,0,0,.08)',
                            border: '1px solid rgba(100,105,255,.1)',
                            fontSize: 13.5, lineHeight: 1.6, color: '#374151',
                            whiteSpace: 'pre-wrap',
                          }}>
                            {msg.content || <em style={{ color: '#9CA3AF' }}>...</em>}
                          </div>

                          {/* Prompt box */}
                          {msg.hasPrompt && msg.prompt && (
                            <div style={{
                              background: 'linear-gradient(135deg,rgba(100,105,255,.08),rgba(139,92,246,.08))',
                              border: '2px solid rgba(100,105,255,.3)',
                              borderRadius: 12, padding: 12,
                              maxWidth: 300,
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                                <span style={{ fontSize: 13 }}>🎨</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#6469ff' }}>
                                  Your Prompt is Ready!
                                </span>
                              </div>
                              <p style={{
                                margin: '0 0 10px', fontSize: 12.5, color: '#374151',
                                lineHeight: 1.5, fontStyle: 'italic',
                                background: 'rgba(255,255,255,.6)', borderRadius: 8,
                                padding: '8px 10px',
                              }}>
                                "{msg.prompt}"
                              </p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleCopyPrompt(msg.prompt, msg.id)}
                                  style={{
                                    flex: 1,
                                    padding: '7px 0',
                                    background: copiedPromptId === msg.id
                                      ? '#10B981'
                                      : 'white',
                                    border: copiedPromptId === msg.id
                                      ? '1.5px solid #10B981'
                                      : '1.5px solid #6469ff',
                                    borderRadius: 8,
                                    color: copiedPromptId === msg.id
                                      ? 'white'
                                      : '#6469ff',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 4,
                                    transition: 'all .25s ease',
                                  }}
                                >
                                  {copiedPromptId === msg.id
                                    ? '✅ Copied!'
                                    : '📋 Copy'}
                                </button>
                                {onUsePrompt && (
                                  <button
                                    onClick={() => { onUsePrompt(msg.prompt); setIsOpen(false); }}
                                    style={{
                                      flex: 1, padding: '7px 0',
                                      background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
                                      border: 'none', borderRadius: 8,
                                      color: 'white', fontSize: 12, fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                    }}>
                                    ✨ Use This
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.role === 'user' && (
                      <div style={{
                        background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
                        borderRadius: '16px 16px 4px 16px',
                        padding: '10px 14px', maxWidth: '80%',
                        fontSize: 13.5, lineHeight: 1.6, color: 'white',
                        boxShadow: '0 2px 8px rgba(100,105,255,.3)',
                      }}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#6469ff,#8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: 14 }}>🤖</span>
                    </div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid rgba(0,0,0,.06)',
            background: 'white',
            display: 'flex', gap: 8, alignItems: 'flex-end',
            flexShrink: 0,
          }}>
            <textarea
              disabled={!isAuthenticated}
              ref={inputRef}
              className="promptbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAuthenticated
                  ? "Describe your idea… (Enter to send)"
                  : "Login to use Artzy Bot"
              }
              rows={1}
              style={{
                flex: 1, padding: '10px 14px',
                background: '#f9fafe', border: '1.5px solid #e5e7eb',
                borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                resize: 'none', fontFamily: 'inherit', color: '#374151',
                transition: 'border-color .2s', maxHeight: 100, overflowY: 'auto',
              }}
              onFocus={e => e.target.style.borderColor = '#6469ff'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={handleSend}
              disabled={
                !isAuthenticated ||
                !input.trim() ||
                loading
              }
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg,#6469ff,#8B5CF6)'
                  : '#e5e7eb',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s', fontSize: 16,
                boxShadow: input.trim() && !loading ? '0 2px 8px rgba(100,105,255,.4)' : 'none',
              }}
            >
              {loading ? '⏳' : '✈️'}
            </button>
          </div>

          {/* Bottom hint */}
          <div style={{
            padding: '6px 14px 8px', background: 'white',
            borderTop: '1px solid rgba(0,0,0,.04)',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: 10.5, color: '#9CA3AF' }}>
              🛡️ Artzy Bot won't help with inappropriate content
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PromptBot;
