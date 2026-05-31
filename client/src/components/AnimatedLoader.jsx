import React, { useState, useEffect } from 'react';

// Animation phases matching the video story
const PHASE = { SLEEPING: 0, POKING: 1, SPLASH: 2, AWAKE: 3, DONE: 4 };

const STATUS_MSGS = [
  'Waking up Artzy-AI…',
  'Poking the server awake…',
  'Splashing some paint on it…',
  'Almost ready to create! ✨',
];

const AnimatedLoader = ({ onDone }) => {
  const [phase, setPhase] = useState(PHASE.SLEEPING);
  const [progress, setProgress] = useState(8);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(PHASE.POKING), 2200);
    const t2 = setTimeout(() => { setPhase(PHASE.SPLASH); setMsgIdx(2); }, 4400);
    const t3 = setTimeout(() => { setPhase(PHASE.AWAKE); setMsgIdx(3); }, 6600);

    const pInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(pInterval); return 90; }
        return p + (p < 40 ? 3 : p < 70 ? 1.5 : 0.7);
      });
    }, 500);

    const mInterval = setInterval(() => {
      setMsgIdx((i) => Math.min(i + 1, STATUS_MSGS.length - 1));
    }, 5000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearInterval(pInterval); clearInterval(mInterval);
    };
  }, []);

  const isSleeping = phase === PHASE.SLEEPING;
  const isPoking = phase === PHASE.POKING;
  const isSplash = phase === PHASE.SPLASH;
  const isAwake = phase >= PHASE.AWAKE;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg,#0f1117 0%,#1a1a2e 50%,#0d0d1a 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter',sans-serif",
    }}>
      <style>{`
        @keyframes bgPulse {
          0%,100%{opacity:.4} 50%{opacity:.7}
        }
        @keyframes sleepBob {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}
        }
        @keyframes zzzFloat1 {
          0%{transform:translate(0,0) scale(1);opacity:.9}
          100%{transform:translate(15px,-50px) scale(.5);opacity:0}
        }
        @keyframes zzzFloat2 {
          0%{transform:translate(0,0) scale(1);opacity:.7}
          100%{transform:translate(-10px,-70px) scale(.4);opacity:0}
        }
        @keyframes zzzFloat3 {
          0%{transform:translate(0,0) scale(1);opacity:.8}
          100%{transform:translate(20px,-90px) scale(.3);opacity:0}
        }
        @keyframes robotWalkIn {
          0%{transform:translateX(-200px) translateY(0);opacity:0}
          20%{opacity:1}
          70%{transform:translateX(-8px) translateY(0)}
          80%{transform:translateX(-8px) translateY(-6px)}
          90%{transform:translateX(-8px) translateY(0)}
          100%{transform:translateX(0) translateY(0)}
        }
        @keyframes robotIdle {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
        }
        @keyframes pokeArm {
          0%,100%{transform:rotate(0deg)}
          30%{transform:rotate(25deg) translateX(12px)}
          60%{transform:rotate(25deg) translateX(12px)}
          80%{transform:rotate(0deg)}
        }
        @keyframes aWobble {
          0%,100%{transform:rotate(0deg) translateY(0)}
          20%{transform:rotate(-3deg) translateY(-2px)}
          40%{transform:rotate(3deg) translateY(2px)}
          60%{transform:rotate(-2deg) translateY(-1px)}
          80%{transform:rotate(2deg) translateY(1px)}
        }
        @keyframes splashPop {
          0%{transform:scale(0) rotate(0deg);opacity:0}
          40%{transform:scale(1.3) rotate(10deg);opacity:1}
          70%{transform:scale(.95) rotate(-5deg);opacity:1}
          100%{transform:scale(1) rotate(0deg);opacity:1}
        }
        @keyframes splashDrop {
          0%{transform:scale(0);opacity:0}
          50%{transform:scale(1.2);opacity:1}
          100%{transform:scale(1);opacity:.9}
        }
        @keyframes aWakeUp {
          0%{filter:brightness(1) drop-shadow(0 0 0px transparent)}
          30%{transform:rotate(-5deg) scale(1.05)}
          60%{transform:rotate(5deg) scale(1.08)}
          100%{filter:brightness(1.4) drop-shadow(0 0 30px rgba(139,92,246,.7));transform:rotate(0deg) scale(1)}
        }
        @keyframes aGlow {
          0%,100%{filter:brightness(1.3) drop-shadow(0 0 15px rgba(139,92,246,.5))}
          50%{filter:brightness(1.6) drop-shadow(0 0 35px rgba(249,115,22,.7))}
        }
        @keyframes celebrateJump {
          0%,100%{transform:translateY(0) rotate(0deg)}
          25%{transform:translateY(-20px) rotate(-10deg)}
          50%{transform:translateY(-25px) rotate(5deg)}
          75%{transform:translateY(-15px) rotate(-5deg)}
        }
        @keyframes starSpin {
          0%{transform:rotate(0deg) scale(0);opacity:0}
          30%{opacity:1;transform:rotate(180deg) scale(1.2)}
          100%{transform:rotate(360deg) scale(1);opacity:1}
        }
        @keyframes starPulse {
          0%,100%{transform:scale(1);opacity:.8}
          50%{transform:scale(1.3);opacity:1}
        }
        @keyframes brushSpin {
          0%{transform:rotate(-20deg)}
          50%{transform:rotate(20deg)}
          100%{transform:rotate(-20deg)}
        }
        @keyframes shimmerA {
          0%{stop-color:#8B5CF6}
          33%{stop-color:#EC4899}
          66%{stop-color:#F97316}
          100%{stop-color:#8B5CF6}
        }
        @keyframes eyeOpen {
          0%,80%{transform:scaleY(0.1)}
          100%{transform:scaleY(1)}
        }
        @keyframes wink {
          0%,80%,100%{transform:scaleY(1)}
          90%{transform:scaleY(0.1)}
        }
        @keyframes paintDrip {
          0%{transform:scaleY(0);transform-origin:top}
          100%{transform:scaleY(1);transform-origin:top}
        }
        .robot-walk { animation: robotWalkIn 1.2s cubic-bezier(.25,.46,.45,.94) forwards; }
        .robot-idle { animation: robotIdle 2s ease-in-out infinite; }
        .robot-celebrate { animation: celebrateJump .6s ease-in-out infinite; }
        .sleep-bob { animation: sleepBob 2.5s ease-in-out infinite; }
        .zzz1 { animation: zzzFloat1 2.2s ease-in-out infinite; }
        .zzz2 { animation: zzzFloat2 2.2s ease-in-out .7s infinite; }
        .zzz3 { animation: zzzFloat3 2.2s ease-in-out 1.4s infinite; }
        .a-wobble { animation: aWobble .5s ease-in-out 3; }
        .a-wakeup { animation: aWakeUp .8s ease-out forwards; }
        .a-glow { animation: aGlow 2s ease-in-out infinite; }
        .poke-arm { animation: pokeArm 1.5s ease-in-out infinite; }
        .splash-pop { animation: splashPop .5s cubic-bezier(.34,1.56,.64,1) forwards; }
        .splash-drop { animation: splashDrop .4s cubic-bezier(.34,1.56,.64,1) forwards; }
        .star-appear { animation: starSpin .6s cubic-bezier(.34,1.56,.64,1) forwards, starPulse 1.5s ease-in-out infinite .6s; }
        .brush-anim { animation: brushSpin 1.5s ease-in-out infinite; }
        .drip-in { animation: paintDrip .6s ease-out forwards; }
      `}</style>

      {/* Background glow blobs */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'20%', left:'20%', width:300, height:300,
          background:'radial-gradient(circle,rgba(139,92,246,.12) 0%,transparent 70%)',
          borderRadius:'50%', animation:'bgPulse 4s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'20%', width:250, height:250,
          background:'radial-gradient(circle,rgba(249,115,22,.08) 0%,transparent 70%)',
          borderRadius:'50%', animation:'bgPulse 4s ease-in-out 2s infinite' }} />
      </div>

      {/* Main scene SVG */}
      <svg viewBox="0 0 420 300" style={{ width:'100%', maxWidth:480, height:'auto' }}>
        <defs>
          <linearGradient id="aGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C3AED"/>
            <stop offset="40%" stopColor="#EC4899"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
          <linearGradient id="robotBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9FAFB"/>
            <stop offset="100%" stopColor="#E5E7EB"/>
          </linearGradient>
          <linearGradient id="brushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316"/>
            <stop offset="100%" stopColor="#EC4899"/>
          </linearGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        {/* ── BIG "A" LETTER ── */}
        <g className={
          isSleeping ? 'sleep-bob'
          : isPoking ? 'a-wobble'
          : isSplash ? 'a-wakeup'
          : 'a-glow'
        } style={{ transformOrigin:'210px 200px', filter: isAwake ? undefined : 'url(#softShadow)' }}>
          {/* Shadow */}
          <ellipse cx="210" cy="258" rx="70" ry="12" fill="rgba(0,0,0,0.25)"/>
          {/* The A */}
          <text x="210" y="250"
            style={{ fontSize:210, fontWeight:900, fontFamily:'Arial Black,Impact,sans-serif',
              fill:'url(#aGrad)', textAnchor:'middle', dominantBaseline:'bottom' }}>A</text>

          {/* Sleeping face on A (visible only when sleeping/poking) */}
          {!isAwake && (
            <g transform="translate(195,145)">
              {/* Closed eyes */}
              <path d="M-12,0 Q-7,-4 -2,0" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              <path d="M5,0 Q10,-4 15,0" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              {/* Sleepy mouth */}
              <path d="M-4,9 Q4,12 10,9" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </g>
          )}

          {/* Awake face on A */}
          {isAwake && (
            <g transform="translate(195,145)" style={{ animation:'eyeOpen .4s ease-out forwards' }}>
              <circle cx="-7" cy="0" r="6" fill="rgba(255,255,255,0.9)"/>
              <circle cx="12" cy="0" r="6" fill="rgba(255,255,255,0.9)"/>
              <circle cx="-6" cy="1" r="3" fill="#1E40AF"/>
              <circle cx="13" cy="1" r="3" fill="#1E40AF"/>
              <circle cx="-5" cy="0" r="1.5" fill="white"/>
              <circle cx="14" cy="0" r="1.5" fill="white"/>
              {/* Big smile */}
              <path d="M-6,12 Q4,20 14,12" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </g>
          )}
        </g>

        {/* ── Zzz BUBBLES (only when sleeping/poking) ── */}
        {(isSleeping || isPoking) && (
          <g>
            <text x="245" y="90" className="zzz1"
              style={{ fontSize:18, fill:'#93C5FD', fontWeight:700, fontFamily:'Arial,sans-serif' }}>Z</text>
            <text x="260" y="65" className="zzz2"
              style={{ fontSize:14, fill:'#BAE6FD', fontWeight:700, fontFamily:'Arial,sans-serif' }}>z</text>
            <text x="272" y="48" className="zzz3"
              style={{ fontSize:11, fill:'#E0F2FE', fontWeight:700, fontFamily:'Arial,sans-serif' }}>z</text>
          </g>
        )}

        {/* ── PAINT SPLASHES (appear at splash phase) ── */}
        {(isSplash || isAwake) && (
          <g>
            {/* Large purple splash */}
            <ellipse cx="175" cy="130" rx="28" ry="20" fill="rgba(139,92,246,.8)"
              transform="rotate(-20,175,130)" className="splash-pop"/>
            {/* Orange splash */}
            <ellipse cx="248" cy="115" rx="20" ry="15" fill="rgba(249,115,22,.75)"
              transform="rotate(15,248,115)" className="splash-pop" style={{animationDelay:'.1s'}}/>
            {/* Pink drops */}
            <circle cx="155" cy="155" r="8" fill="rgba(236,72,153,.7)" className="splash-drop" style={{animationDelay:'.05s'}}/>
            <circle cx="265" cy="140" r="6" fill="rgba(168,85,247,.7)" className="splash-drop" style={{animationDelay:'.15s'}}/>
            <circle cx="230" cy="105" r="5" fill="rgba(249,115,22,.8)" className="splash-drop" style={{animationDelay:'.2s'}}/>
            {/* Drip down the A */}
            <rect x="188" y="160" width="8" height="30" rx="4" fill="rgba(139,92,246,.6)" className="drip-in"/>
            <rect x="218" y="150" width="6" height="25" rx="3" fill="rgba(249,115,22,.6)" className="drip-in" style={{animationDelay:'.1s'}}/>
            {/* Floor splats */}
            <ellipse cx="160" cy="265" rx="18" ry="6" fill="rgba(139,92,246,.4)" className="splash-drop" style={{animationDelay:'.3s'}}/>
            <ellipse cx="255" cy="262" rx="14" ry="5" fill="rgba(249,115,22,.4)" className="splash-drop" style={{animationDelay:'.35s'}}/>
          </g>
        )}

        {/* ── CELEBRATION STARS (awake phase) ── */}
        {isAwake && (
          <g>
            <text x="290" y="120" className="star-appear"
              style={{ fontSize:22, fill:'#FBBF24', animationDelay:'.2s' }}>✦</text>
            <text x="320" y="95" className="star-appear"
              style={{ fontSize:16, fill:'#F472B6', animationDelay:'.4s' }}>✦</text>
            <text x="140" y="100" className="star-appear"
              style={{ fontSize:14, fill:'#A78BFA', animationDelay:'.3s' }}>✦</text>
          </g>
        )}

        {/* ── ROBOT CHARACTER ── */}
        <g className={
          isSleeping ? 'robot-walk'
          : isAwake ? 'robot-celebrate'
          : 'robot-idle'
        } style={{ transformOrigin:'95px 200px' }}>
          <g transform="translate(60,110)">
            {/* Robot shadow */}
            <ellipse cx="35" cy="118" rx="22" ry="6" fill="rgba(0,0,0,.2)"/>

            {/* Robot legs */}
            <rect x="19" y="100" width="12" height="18" rx="6" fill="#D1D5DB"/>
            <rect x="40" y="100" width="12" height="18" rx="6" fill="#D1D5DB"/>
            {/* Feet */}
            <ellipse cx="25" cy="118" rx="9" ry="5" fill="#9CA3AF"/>
            <ellipse cx="46" cy="118" rx="9" ry="5" fill="#9CA3AF"/>

            {/* Robot body */}
            <rect x="12" y="52" width="47" height="52" rx="14" fill="url(#robotBody)" filter="url(#softShadow)"/>
            {/* Body detail dots */}
            <circle cx="26" cy="68" r="3" fill="#D1D5DB"/>
            <circle cx="35" cy="68" r="3" fill="#D1D5DB"/>
            <circle cx="44" cy="68" r="3" fill="#D1D5DB"/>
            {/* Body stripe */}
            <rect x="16" y="82" width="39" height="6" rx="3" fill="rgba(139,92,246,.25)"/>

            {/* Left arm (simple) */}
            <rect x="0" y="56" width="14" height="9" rx="4.5" fill="#E5E7EB"/>
            <circle cx="0" cy="60" r="5" fill="#D1D5DB"/>

            {/* Right arm + paintbrush */}
            <g className={isPoking ? 'poke-arm' : ''} style={{ transformOrigin:'58px 60px' }}>
              <rect x="57" y="56" width="14" height="9" rx="4.5" fill="#E5E7EB"/>
              <circle cx="71" cy="60" r="5" fill="#D1D5DB"/>
              {/* Brush handle */}
              <rect x="74" y="38" width="5" height="32" rx="2.5" fill="#8B5CF6"/>
              {/* Brush head */}
              <ellipse cx="76.5" cy="36" rx="7" ry="5" fill="url(#brushGrad)"/>
              <ellipse cx="76.5" cy="33" rx="5" ry="3" fill="#FBBF24"/>
            </g>

            {/* Robot neck */}
            <rect x="28" y="40" width="14" height="14" rx="3" fill="#E5E7EB"/>

            {/* Robot head */}
            <rect x="8" y="0" width="55" height="44" rx="20" fill="url(#robotBody)" filter="url(#softShadow)"/>

            {/* Left eye */}
            <circle cx="24" cy="18" r="10" fill="#1E40AF"/>
            <circle cx="24" cy="18" r="7" fill="#3B82F6"/>
            <circle cx="24" cy="18" r="4" fill="#1E3A5F"/>
            <circle cx="26" cy="16" r="2" fill="white"/>

            {/* Right eye — winking (closed arc) */}
            <path d="M37 18 Q43 13 49 18" stroke="#1E40AF" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M38 19 Q43 15 48 19" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Smile */}
            <path d="M20 32 Q28 38 37 32" stroke="#6B7280" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Antenna */}
            <rect x="31" y="-16" width="4" height="18" rx="2" fill="#8B5CF6"/>
            <circle cx="33" cy="-19" r="6" fill="#7C3AED"/>
            <circle cx="33" cy="-19" r="3" fill="#A78BFA"/>
          </g>
        </g>

        {/* ── BUCKET (only in splash phase) ── */}
        {isSplash && (
          <g transform="translate(58,140)" className="splash-pop">
            <rect x="0" y="10" width="28" height="20" rx="4" fill="#7C3AED"/>
            <rect x="2" y="8" width="24" height="5" rx="2" fill="#8B5CF6"/>
            {/* Paint dripping */}
            <ellipse cx="14" cy="10" rx="10" ry="5" fill="#A78BFA"/>
            <rect x="10" y="10" width="6" height="12" rx="3" fill="rgba(139,92,246,.6)"/>
          </g>
        )}
      </svg>

      {/* Text below scene */}
      <div style={{ textAlign:'center', marginTop:8, padding:'0 20px' }}>
        <h1 style={{
          margin:0, fontSize:28, fontWeight:900, letterSpacing:'-0.5px',
          background:'linear-gradient(90deg,#8B5CF6,#EC4899,#F97316)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text',
        }}>
          Artzy-AI
        </h1>
        <p style={{ margin:'6px 0 16px', color:'rgba(255,255,255,.5)', fontSize:13 }}>
          AI-Powered Art Generation
        </p>

        {/* Status text */}
        <p style={{
          margin:'0 0 12px', color:'rgba(255,255,255,.8)', fontSize:14,
          fontWeight:600, minHeight:22, transition:'opacity .3s',
        }}>
          {STATUS_MSGS[msgIdx]}
        </p>

        {/* Progress bar */}
        <div style={{ width:260, height:5, background:'rgba(255,255,255,.1)', borderRadius:99, overflow:'hidden', margin:'0 auto' }}>
          <div style={{
            height:'100%', borderRadius:99,
            background:'linear-gradient(90deg,#6469ff,#8b5cf6,#EC4899)',
            width:`${progress}%`,
            transition:'width .6s ease',
          }}/>
        </div>

        {/* Tip */}
        <div style={{
          marginTop:20, maxWidth:300, background:'rgba(255,255,255,.05)',
          border:'1px solid rgba(255,255,255,.1)', borderRadius:14,
          padding:'10px 16px',
        }}>
          <p style={{ margin:0, color:'rgba(255,255,255,.4)', fontSize:11.5, lineHeight:1.6 }}>
            💡 Free servers sleep after 15 min of inactivity. Once awake, everything runs fast!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLoader;
