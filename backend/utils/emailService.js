const axios = require("axios");

const sendOtpEmail = async ({ to, fullName, otp }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "FreshMart",
          email: "FreshMartvegetables90@gmail.com",
        },
        to: [
          {
            email: to,
            name: fullName,
          },
        ],
        subject: "Fresh Mart OTP Verification",
        htmlContent: `
          <h2>Hello ${fullName}</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OTP Email Sent Successfully");
  } catch (error) {
    console.log(
      "Brevo OTP Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const sendContactEmail = async ({
  name,
  email,
  message,
}) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "FreshMart",
          email: "FreshMartvegetables90@gmail.com",
        },
        to: [
          {
            email: "FreshMartvegetables90@gmail.com",
          },
        ],
        subject: "New Contact Message",
        htmlContent: `
          <h2>New Contact Message</h2>

          <p><b>Name:</b> ${name}</p>

          <p><b>Email:</b> ${email}</p>

          <p><b>Message:</b></p>

          <p>${message}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Contact Email Sent Successfully");
  } catch (error) {
    console.log(
      "Brevo Contact Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  sendOtpEmail,
  sendContactEmail,
};