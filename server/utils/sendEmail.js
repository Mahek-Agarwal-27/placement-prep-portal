const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer with SMTP config or logs reset URL in dev mode.
 * @param {Object} options - { email, subject, message, html, resetUrl }
 */
const sendEmail = async (options) => {
  console.log(`\n========================================================================`);
  console.log(`📧 PASSWORD RESET REQUEST FOR: ${options.email}`);
  if (options.resetUrl) {
    console.log(`🔗 [DEV RESET LINK]: ${options.resetUrl}`);
  }
  console.log(`========================================================================\n`);

  // Check if SMTP configuration exists in process.env
  const hasSMTPConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

  if (!hasSMTPConfig) {
    console.log('ℹ️ Nodemailer SMTP not configured in .env. Use [DEV RESET LINK] above for testing.');
    return { sent: false, devMode: true, resetUrl: options.resetUrl };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HireNova AI Portal" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; margin-bottom: 8px;">Reset Your HireNovaAI Password</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">Hello,</p>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">You requested a password reset for your HireNovaAI account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${options.resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px;">This link will expire in <strong>30 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset password email successfully dispatched to ${options.email}`);
    return { sent: true, devMode: false };

  } catch (smtpError) {
    console.warn(`⚠️ SMTP dispatch error: ${smtpError.message}. Check [DEV RESET LINK] in console above.`);
    return { sent: false, devMode: true, resetUrl: options.resetUrl };
  }
};

module.exports = sendEmail;
