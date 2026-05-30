import React, { useState, useEffect } from 'react';

const messages = [
  { text: 'Waking up the server…', sub: 'Free tier servers sleep after 15 min of inactivity' },
  { text: 'Stretching and yawning…', sub: 'Almost there, this usually takes 30–60 seconds' },
  { text: 'Loading dependencies…', sub: 'Connecting to database and services' },
  { text: 'Almost ready…', sub: 'Just a few more seconds' },
];

const RenderLoader = ({ onReady }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, messages.length - 1));
    }, 8000);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        const increment = p < 40 ? 3 : p < 70 ? 1.5 : 0.5;
        return Math.min(p + increment, 95);
      });
    }, 600);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0f1117] via-[#1a1a2e] to-[#16213e]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6469ff]/10 rounded-full blur-3xl morphing" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl morphing" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6469ff]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center px-8 max-w-md w-full">
        {/* Logo */}
        <div className="floating mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6469ff] to-[#8b5cf6] shadow-2xl shadow-[#6469ff]/30 mb-4">
            <span className="text-4xl">🎨</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Artzy<span className="text-[#6469ff]">-AI</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI-Powered Art Generation</p>
        </div>

        {/* Spinner ring */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <svg className="w-20 h-20 animate-spin-slow" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1f2937" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="url(#grad)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34 * (progress / 100)} ${2 * Math.PI * 34}`}
              strokeDashoffset={2 * Math.PI * 34 * 0.25}
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6469ff" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-white font-bold text-sm">{Math.round(progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6469ff] to-[#8b5cf6] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <div className="min-h-[60px]">
          <p className="text-white font-semibold text-lg">
            {messages[msgIndex].text}<span className="text-[#6469ff]">{dots}</span>
          </p>
          <p className="text-gray-400 text-sm mt-2">{messages[msgIndex].sub}</p>
        </div>

        {/* Tip box */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            💡 <span className="text-gray-300 font-medium">Why the wait?</span> This app runs on a free cloud tier
            that pauses when inactive. Once loaded, everything runs fast!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RenderLoader;
