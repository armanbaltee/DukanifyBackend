const Contact = require("../../models/contact.model");
const nodemailer = require("nodemailer");

const validateContact = async (req, res) => {
  const { firstName, lastName, phone, email, message } = req.body;
  console.log("Contact Data:", req.body);

  try {
    const contact = new Contact(req.body);
    await contact.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Contact Submission from ${firstName}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br>${message}</p>
        <hr>
        <p>This message was submitted from the Dukanify Contact Page.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Message sent and saved successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ error: "Failed to process contact form." });
  }
};

module.exports = {
  validateContact,
};
