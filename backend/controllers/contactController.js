
const { sendContactEmail } = require("../utils/emailService");
const Contact = require("../models/Contact");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await Contact.create({
      name,
      email,
      message,
    });

    await sendContactEmail({
      name,
      email,
      message,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};