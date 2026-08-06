const asyncHandler = require('../utils/asyncHandler');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const User = require('../models/User');

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const captchaA = Number(req.body.captchaA);
  const captchaB = Number(req.body.captchaB);
  const captchaAnswer = Number(req.body.captchaAnswer);

  if (captchaA + captchaB !== captchaAnswer) {
    res.status(400);
    throw new Error('Captcha incorrect');
  }

  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email },
    {
      email,
      consent: true,
      consentAt: new Date(),
      source: req.body.source || 'footer',
      isActive: true,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await User.updateOne({ email }, { $set: { marketingConsent: true } });

  res.status(200).json({
    message: 'Inscription newsletter confirmee.',
    subscriber: {
      email: subscriber.email,
      isActive: subscriber.isActive,
      consentAt: subscriber.consentAt,
    },
  });
});

module.exports = { subscribeNewsletter };
