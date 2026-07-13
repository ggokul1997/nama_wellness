import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from '../logger/logger.js';

// =============================================================
// Ethereal Email Service
// =============================================================
// Ethereal is a free fake SMTP service from Nodemailer.
// All emails are captured — nothing is delivered to real inboxes.
// View sent emails at: https://ethereal.email/messages
//
// First run: if ETHEREAL_USER/PASS are not set, a new test account
// is auto-created and credentials are printed to the terminal.
// Copy those into your .env file to reuse the same inbox.
// =============================================================

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  // Use custom SMTP if provided (e.g., Resend in production, Mailpit in Docker dev)
  if (config.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT || 1025,
      // Ports 465 and 2465 use implicit TLS. Other ports (587, 2525) use STARTTLS.
      secure: config.SMTP_PORT === 465 || config.SMTP_PORT === 2465,
      auth: config.SMTP_USER ? {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS || '',
      } : undefined,
    });
    logger.info({ host: config.SMTP_HOST, port: config.SMTP_PORT || 1025 }, '📧 Custom SMTP configured');
    return transporter;
  }

  // In production, SMTP_HOST MUST be configured. Failing silently here means
  // real users will never receive verification or password-reset emails.
  if (config.NODE_ENV === 'production') {
    throw new Error(
      '❌ SMTP_HOST is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables. ' +
      'Without this, no emails will be delivered to real users.'
    );
  }

  if (config.ETHEREAL_USER && config.ETHEREAL_PASS) {
    // Reuse existing test account from .env
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.ETHEREAL_USER,
        pass: config.ETHEREAL_PASS,
      },
    });
    logger.info({ user: config.ETHEREAL_USER }, '📧 Ethereal SMTP configured');
  } else {
    // Auto-create a new Ethereal test account
    logger.info('📧 Creating Ethereal test email account...');
    const testAccount = await nodemailer.createTestAccount();

    logger.info(
      {
        user: testAccount.user,
        pass: testAccount.pass,
        webUrl: 'https://ethereal.email/messages',
      },
      `📧 Ethereal test account created — copy these to your .env:
  ETHEREAL_USER="${testAccount.user}"
  ETHEREAL_PASS="${testAccount.pass}"
  View emails at: https://ethereal.email/messages (login with the above credentials)`,
    );

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: config.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  // Log the preview URL (only applies to Ethereal)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info({ to: options.to, subject: options.subject, previewUrl }, '📧 Email sent — view at preview URL');
  } else {
    logger.info({ to: options.to, subject: options.subject }, '📧 Email sent');
  }
}

// =============================================================
// Email templates
// =============================================================

export const emailService = {
  async sendVerificationOTP(email: string, otp: string, firstName: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: 'Verify your Nama Wellness account',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f0f1a; color: #e2e8f0; border-radius: 12px;">
          <h1 style="color: #a78bfa; font-size: 24px; margin-bottom: 8px;">Nama Wellness</h1>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Verify your email, ${firstName}</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Use this code to verify your email address. It expires in 15 minutes.</p>
          <div style="background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #c4b5fd;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you didn't create this account, ignore this email.</p>
        </div>
      `,
      text: `Your Nama Wellness verification code is: ${otp}\nExpires in 15 minutes.`,
    });
  },

  async sendPasswordResetOTP(email: string, otp: string, firstName: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: 'Reset your Nama Wellness password',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f0f1a; color: #e2e8f0; border-radius: 12px;">
          <h1 style="color: #a78bfa; font-size: 24px; margin-bottom: 8px;">Nama Wellness</h1>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Reset your password, ${firstName}</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Use this code to reset your password. It expires in 15 minutes.</p>
          <div style="background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #c4b5fd;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
      text: `Your Nama Wellness password reset code is: ${otp}\nExpires in 15 minutes.`,
    });
  },

  async sendEmployeeInviteOTP(email: string, otp: string, companyName: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: `You have been invited to join ${companyName} on Nama Wellness`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0f0f1a; color: #e2e8f0; border-radius: 12px;">
          <h1 style="color: #a78bfa; font-size: 24px; margin-bottom: 8px;">Nama Wellness</h1>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Welcome to ${companyName}!</h2>
          <p style="color: #94a3b8; margin-bottom: 24px;">Your company has invited you to join their learning platform on Nama Wellness.</p>
          <p style="color: #94a3b8; margin-bottom: 24px;">Please click the button below to navigate to the <strong>Reset Password</strong> page and use the setup code to set your initial password. This code expires in 15 minutes.</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${config.WEB_BASE_URL}/reset-password?email=${encodeURIComponent(email)}" style="display: inline-block; background: #8b5cf6; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Set Up Account</a>
          </div>
          <div style="background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #c4b5fd;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you weren't expecting this invitation, please ignore this email.</p>
        </div>
      `,
      text: `You have been invited to join ${companyName} on Nama Wellness. Your setup code is: ${otp}\nExpires in 15 minutes.`,
    });
  },
};
