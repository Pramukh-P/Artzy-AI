import { useState, useEffect, useRef } from 'react';

const HEALTH_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/health`;
const COLD_START_THRESHOLD_MS = 4000; // If no response in 4s → cold start
const MAX_WAIT_MS = 120000; // 2 min max

/**
 * Returns: 'pending' | 'cold' | 'ready'
 *
 * Strategy:
 * - Do a quick health check immediately on mount (before showing any page content)
 * - If response comes back fast (< 4s) → status = 'ready' immediately, no loader shown
 * - If response is slow or times out → status = 'cold', show loader until server responds
 * - This prevents the jarring "page loads then loader appears" issue
 */
const useServerHealth = () => {
  const [status, setStatus] = useState('pending');
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // Show cold-start loader if initial ping takes > COLD_START_THRESHOLD_MS
    const coldTimer = setTimeout(() => {
      if (!cancelled && !doneRef.current) {
        setStatus('cold');
      }
    }, COLD_START_THRESHOLD_MS);

    const pingServer = async () => {
      while (!cancelled) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const res = await fetch(HEALTH_URL, { signal: controller.signal });
          clearTimeout(timeout);

          if (res.ok) {
            clearTimeout(coldTimer);
            doneRef.current = true;
            if (!cancelled) setStatus('ready');
            return;
          }
        } catch {
          // Server still sleeping, retry
        }

        // Give up after max wait
        if (Date.now() - startRef.current > MAX_WAIT_MS) {
          clearTimeout(coldTimer);
          if (!cancelled) setStatus('ready');
          return;
        }

        // Wait before next ping
        await new Promise((r) => setTimeout(r, 3500));
      }
    };

    pingServer();

    return () => {
      cancelled = true;
      clearTimeout(coldTimer);
    };
  }, []);

  return status; // 'pending' | 'cold' | 'ready'
};

export default useServerHealth;
