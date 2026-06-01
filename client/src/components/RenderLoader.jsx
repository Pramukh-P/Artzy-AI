import React, { useState, useEffect, useRef } from 'react';
import Logo from '../assets/Logo2.png';

/**
 * Place your Loader.mp4 file at: client/public/Loader.mp4
 * The loader shows BEFORE React renders anything — it intercepts cold starts.
 */
const RenderLoader = () => {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const videoRef = useRef(null);

  const statusMessages = [
    'Waking up Artzy-AI…',
    'Poking the server awake…',
    'Splashing some paint on it…',
    'Almost ready to create! ✨',
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 93) return p;
        const step = p < 30 ? 4 : p < 60 ? 2 : p < 80 ? 1 : 0.4;
        return Math.min(p + step, 93);
      });
    }, 600);

    // Cycle status messages
    const msgInterval = setInterval(() => {
      setStatusIdx((i) => (i + 1) % statusMessages.length);
    }, 5500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(msgInterval);
    };
  }, []);

  // Ensure video loops smoothly
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = 1;
    const handleEnded = () => { vid.currentTime = 0; vid.play(); };
    vid.addEventListener('ended', handleEnded);
    return () => vid.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1a2e 50%, #0d0d1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', Arial, sans-serif",
      overflow: 'hidden',
    }}>

      {/* ── Background ambient blobs ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(139,92,246,.10) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'bgBlob 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%',
          width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(236,72,153,.07) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'bgBlob 6s ease-in-out 3s infinite',
        }} />
        {/* Paint splatter decorations - matching video style */}
        <div style={{
          position:'absolute', top:'8%', right:'15%',
          width:24, height:24, borderRadius:'50%',
          background:'rgba(139,92,246,.3)',
          animation:'floatDot 4s ease-in-out infinite',
        }}/>
        <div style={{
          position:'absolute', bottom:'20%', left:'8%',
          width:16, height:16, borderRadius:'50%',
          background:'rgba(236,72,153,.25)',
          animation:'floatDot 5s ease-in-out 1s infinite',
        }}/>
        <div style={{
          position:'absolute', top:'30%', right:'8%',
          width:10, height:10, borderRadius:'50%',
          background:'rgba(96,165,250,.3)',
          animation:'floatDot 3.5s ease-in-out 2s infinite',
        }}/>
      </div>

      <style>{`
        @keyframes bgBlob {
          0%,100%{opacity:.6;transform:scale(1)}
          50%{opacity:1;transform:scale(1.15)}
        }
        @keyframes floatDot {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-14px)}
        }
        @keyframes progressGlow {
          0%,100%{box-shadow:0 0 8px rgba(100,105,255,.4)}
          50%{box-shadow:0 0 20px rgba(139,92,246,.7)}
        }
        @keyframes fadeStatus {
          0%{opacity:0;transform:translateY(8px)}
          15%,85%{opacity:1;transform:translateY(0)}
          100%{opacity:0;transform:translateY(-8px)}
        }
        @keyframes logoFloat {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-6px)}
        }
      `}</style>

      {/* ── Logo at top ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        animation: 'logoFloat 3s ease-in-out infinite',
      }}>
        <div style={{
          width: 70, height: 70, borderRadius: 14,
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}><img
              src={Logo}
              alt="Artzy Bot"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
            /></div>
        <span style={{
          fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px',
          background: 'linear-gradient(90deg,#8B5CF6,#EC4899,#F97316)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>Artzy-AI</span>
      </div>

      {/* ── VIDEO (Loader.mp4) ── */}
      <div style={{
        width: '90%', maxWidth: 560,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05)',
        position: 'relative',
        background: '#1a1a2e', // fallback if video not found
      }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            width: '100%',
            display: 'block',
            borderRadius: 24,
          }}
          onError={(e) => {
            // If video fails to load, hide gracefully
            e.target.style.display = 'none';
          }}
        >
          {/* Place Loader.mp4 in client/public/ folder */}
          <source src="/Loader.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay at bottom of video — seamless blend */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent, rgba(15,17,23,.9))',
          borderRadius: '0 0 24px 24px',
        }} />

        {/* "Waking up…" text overlay at bottom of video */}
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          textAlign: 'center',
        }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 700,
            color: 'rgba(255,255,255,.8)',
            textShadow: '0 1px 8px rgba(0,0,0,.8)',
            animation: 'fadeStatus 5.5s ease-in-out infinite',
          }}>
            {statusMessages[statusIdx]}
          </p>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ width: '100%', maxWidth: 480, marginTop: 20, padding: '0 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.4)', fontWeight:600 }}>
            Starting server…
          </span>
          <span style={{ fontSize:12, color:'#8B5CF6', fontWeight:700 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{
          width: '100%', height: 6,
          background: 'rgba(255,255,255,.08)',
          borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 99,
            background: 'linear-gradient(90deg, #6469ff, #8B5CF6, #EC4899)',
            width: `${progress}%`,
            transition: 'width .7s ease',
            animation: 'progressGlow 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ── Info box ── */}
      <div style={{
        marginTop: 20, maxWidth: 420, width: '100%', padding: '0 16px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 14, padding: '10px 16px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.6 }}>
            💡 Free servers nap after 15 min of inactivity. Usually awake in <strong style={{color:'rgba(255,255,255,.5)'}}>30–60 seconds</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RenderLoader;
