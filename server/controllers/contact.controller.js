import nodemailer from 'nodemailer';

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create transporter using env vars
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `"EdStream Contact" <${process.env.SMTP_USER}>`,
      to: receiverEmail,
      replyTo: email,
      subject: `[EdStream Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555; width: 120px;">Name:</td>
              <td style="padding: 10px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 10px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Subject:</td>
              <td style="padding: 10px;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 20px; background: #f8f8f8; border-radius: 8px;">
            <h3 style="margin: 0 0 10px; color: #333;">Message:</h3>
            <p style="margin: 0; white-space: pre-wrap; color: #555; line-height: 1.6;">${message}</p>
          </div>
          <p style="margin-top: 24px; font-size: 0.85rem; color: #999;">
            Sent from EdStream Contact Form
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('SendContactEmail error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};
