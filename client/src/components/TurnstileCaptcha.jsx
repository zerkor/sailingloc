import { useEffect, useId, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

/* global __TURNSTILE_SITE_KEY__ */
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || __TURNSTILE_SITE_KEY__;
let scriptPromise;

const loadTurnstileScript = () => {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptPromise;
};

const TurnstileCaptcha = ({ onVerify, onExpire, required = true, label = 'Vérification anti-spam' }) => {
  const containerId = useId().replace(/:/g, '');
  const containerRef = useRef(null);
  const widgetRef = useRef(null);
  const [status, setStatus] = useState(siteKey ? 'loading' : 'disabled');

  useEffect(() => {
    if (!siteKey || !containerRef.current) return undefined;
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token) => {
            setStatus('verified');
            onVerify(token);
          },
          'expired-callback': () => {
            setStatus('expired');
            onExpire?.();
          },
          'error-callback': (code) => {
            if (code) console.warn('Cloudflare Turnstile error:', code);
            setStatus('error');
            onExpire?.();
          },
        });
      })
      .catch(() => {
        setStatus('error');
        onExpire?.();
      });

    return () => {
      cancelled = true;
      if (window.turnstile && widgetRef.current) {
        window.turnstile.remove(widgetRef.current);
      }
    };
  }, [onExpire, onVerify]);

  if (!siteKey) return null;

  return (
    <div className="turnstile-box">
      <div className="turnstile-box__label">
        <ShieldCheck size={16} aria-hidden="true" />
        <span>{label}</span>
        {required && <strong>requis</strong>}
      </div>
      <div id={containerId} ref={containerRef} className="turnstile-box__widget" />
      {status === 'error' && (
        <p>Le captcha Cloudflare est bloqué. Vérifiez que le domaine Render est autorisé dans Turnstile.</p>
      )}
      {status === 'expired' && <p>La vérification a expiré, cochez à nouveau le captcha.</p>}
    </div>
  );
};

export const isTurnstileConfigured = Boolean(siteKey);
export default TurnstileCaptcha;
