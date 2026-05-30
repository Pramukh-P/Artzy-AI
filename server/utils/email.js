import axios from 'axios';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, toName, subject, htmlContent }) => {
  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'Artzy-AI',
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error?.response?.data || error.message);
    return { success: false, error: error?.response?.data };
  }
};

export const sendOTPEmail = async (email, name, otp, type = 'verify') => {
  const isReset = type === 'reset';
  const subject = isReset ? 'Reset Your Artzy-AI Password' : 'Verify Your Artzy-AI Account';
  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const description = isReset
    ? 'You requested a password reset. Use the OTP below to reset your password. This OTP is valid for 10 minutes.'
    : 'Thank you for signing up! Use the OTP below to verify your email address. This OTP is valid for 10 minutes.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f8;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#6469ff 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                    🎨 Artzy<span style="opacity:0.8;">-AI</span>
                  </h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">AI-Powered Art Generation</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h2 style="margin:0 0 12px;color:#222328;font-size:22px;font-weight:700;">${heading}</h2>
                  <p style="margin:0 0 28px;color:#666e75;font-size:15px;line-height:1.6;">Hi ${name},<br><br>${description}</p>
                  <!-- OTP Box -->
                  <div style="background:linear-gradient(135deg,#f0f1ff 0%,#f5f0ff 100%);border:2px dashed #6469ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                    <p style="margin:0 0 8px;color:#666e75;font-size:13px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your OTP Code</p>
                    <p style="margin:0;color:#6469ff;font-size:40px;font-weight:800;letter-spacing:10px;">${otp}</p>
                  </div>
                  <p style="margin:0;color:#999;font-size:13px;line-height:1.6;">⏱ This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafe;padding:20px 40px;border-top:1px solid #e6ebf4;text-align:center;">
                  <p style="margin:0;color:#aaa;font-size:12px;">© 2025 Artzy-AI · All rights reserved</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({ to: email, toName: name, subject, htmlContent });
};

export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#f4f4f8;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#6469ff 0%,#8b5cf6 100%);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">🎨 Artzy-AI</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">AI-Powered Art Generation</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h2 style="margin:0 0 12px;color:#222328;font-size:22px;font-weight:700;">Welcome to Artzy-AI! 🚀</h2>
                  <p style="margin:0 0 20px;color:#666e75;font-size:15px;line-height:1.6;">Hi ${name},<br><br>We're thrilled to have you on board! You can now generate stunning AI-powered images using our platform.</p>
                  <div style="background:#f0f1ff;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;color:#6469ff;font-weight:700;font-size:15px;">🎁 Your Free Quota</p>
                    <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">You get <strong>10 free image generations per week</strong>. Your quota resets every Monday.</p>
                  </div>
                  <p style="margin:0;color:#666e75;font-size:14px;line-height:1.6;">Start creating amazing art and share your creations with the community!</p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9fafe;padding:20px 40px;border-top:1px solid #e6ebf4;text-align:center;">
                  <p style="margin:0;color:#aaa;font-size:12px;">© 2025 Artzy-AI · All rights reserved</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmail({ to: email, toName: name, subject: 'Welcome to Artzy-AI! 🎨', htmlContent });
};
