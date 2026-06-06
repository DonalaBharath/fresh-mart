


const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const sendOtpEmail = async ({ to, fullName, otp }) => {
  try {
    const info = await transporter.sendMail({
      from: "Freshmart<bharathkumarsriramulu005@gmail.com>",
      to,
      subject: "Fresh Mart OTP Verification",
      html: `
        <h2>Hello ${fullName}</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("OTP Email Sent:", info.messageId);
  } catch (error) {
    console.log("Email Error:", error);
    throw error;
  }
};
 const sendContactEmail = async ({
  name,
  email,
  message,
}) => {
  try {
    await transporter.sendMail({
      from: "Freshmart <bharathkumarsriramulu005@gmail.com>",

      to: "FreshMartvegetables90@gmail.com",

      subject: "New Contact Message",

      html: `
        <h2>New Contact Message</h2>

        <p><b>Name:</b> ${name}</p>

        <p><b>Email:</b> ${email}</p>

        <p><b>Message:</b></p>

        <p>${message}</p>
      `,
    });

  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
  sendContactEmail,
};
