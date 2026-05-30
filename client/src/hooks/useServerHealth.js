import { useState, useEffect, useRef } from 'react';

const HEALTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/health`;
const TIMEOUT_MS = 5000; // If health check takes > 5s, show cold start loader
const MAX_WAIT_MS = 90000; // Give up after 90s

const useServerHealth = () => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'cold' | 'ready'
  const startTime = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    let timer;

    // Show cold-start loader if initial check takes > 5s
    timer = setTimeout(() => {
      if (!cancelled && status === 'checking') setStatus('cold');
    }, TIMEOUT_MS);

    const ping = async () => {
      while (!cancelled) {
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(HEALTH_URL, { signal: controller.signal });
          clearTimeout(t);
          if (res.ok) {
            clearTimeout(timer);
            if (!cancelled) setStatus('ready');
            return;
          }
        } catch {
          // Retry
        }
        if (Date.now() - startTime.current > MAX_WAIT_MS) {
          if (!cancelled) setStatus('ready'); // Give up, let them try
          return;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    ping();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return status;
};

export default useServerHealth;
