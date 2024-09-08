import { config } from '../config/config.js';
import { logger } from '../config/logger.js';
import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport(config.email.smtp);
transport
  .verify()
  .then(() => logger.info('Connected to email server'))
  .catch(() =>
    logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'),
  );

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (email, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
    To reset your password, click on this link: ${resetPasswordUrl}
    If you did not request any password resets, then ignore this email.`;

  await sendEmail(email, subject, text);
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

export { sendEmail, sendResetPasswordEmail, transport };
