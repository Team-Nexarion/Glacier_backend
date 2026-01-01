const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");


if (!process.env.MAILTRAP_API_TOKEN) {
  throw new Error("MAILTRAP_API_TOKEN is missing in .env");
}

/*const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_API_TOKEN,
  })
);*/

//// for development
var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "332c0265f9ff6d",
    pass: "0858fca73c6053"
  }
});

/**
 * Send a plain-text email
 * @param {Object} params
 * @param {string|string[]} params.to - recipient email(s)
 * @param {string} params.subject - email subject
 * @param {string} params.text - plain text body
 */
async function sendMail({ to, subject, text }) {
  if (!to || !subject || !text) {
    throw new Error("sendMail: to, subject and text are required");
  }

  try {
    const info = await transport.sendMail({
      from: {
        address: process.env.MAIL_USER || "no-reply@localhost",
        name: "Glacier App",
      },
      to,
      subject,
      text,
    });

    return info;
  } catch (error) {
    console.error("Email send failed:", error.message);
    throw error;
  }
}

module.exports = sendMail;
