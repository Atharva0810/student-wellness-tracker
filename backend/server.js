// backend/server.js
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Validate env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const COUNSELOR_EMAIL = process.env.COUNSELOR_EMAIL || ''; // set in .env

if(!EMAIL_USER || !EMAIL_PASS){
  console.warn('Warning: EMAIL_USER or EMAIL_PASS not set in .env. Emails will fail.');
}

app.post('/send-email', async (req, res) => {
  const { name, email, stress, message } = req.body;

  if(!email){
    return res.status(400).json({ success: false, error: 'No recipient email provided' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS, // For Gmail: use App Password
      },
    });

    // Prepare recipients - student and optionally counselor
    const recipients = [email];
    if(COUNSELOR_EMAIL) recipients.push(COUNSELOR_EMAIL);

    // You can send different content to counselor if needed; here both get same text
    const mailOptions = {
      from: EMAIL_USER,
      to: recipients, // array of emails
      subject: 'Student Wellness Tracker — High Stress Alert',
      text:
        `Hello ${name || 'Student'},\n\n` +
        `${message}\n\n` +
        `Reported stress level: ${stress}\n\n` +
        `— Student Wellness Tracker`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, info: info.response });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, error: 'Failed to send email', details: err.toString() });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
