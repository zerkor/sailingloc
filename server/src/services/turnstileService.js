const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const isTurnstileEnabled = () => Boolean(process.env.TURNSTILE_SECRET_KEY);

const verifyTurnstileToken = async ({ token, ip }) => {
  if (!isTurnstileEnabled()) {
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false, error: 'Captcha requis' };
  }

  const body = new URLSearchParams();
  body.append('secret', process.env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await response.json();
    return {
      success: data.success === true,
      error: data['error-codes']?.join(', ') || null,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const requireTurnstile = async (req) => {
  const result = await verifyTurnstileToken({
    token: req.body.turnstileToken,
    ip: req.ip,
  });

  if (!result.success) {
    const error = new Error('Verification captcha echouee');
    error.statusCode = 400;
    throw error;
  }

  return result;
};

module.exports = { isTurnstileEnabled, verifyTurnstileToken, requireTurnstile };
