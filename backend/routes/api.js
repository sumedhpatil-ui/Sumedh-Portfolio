const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Message = require('../models/Message');

// Basic email format check — not exhaustive, just catches obvious junk
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Set up the transporter once. If email env vars are missing, emails are
// skipped but the message still saves to the database.
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function notifyByEmail(msg) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
      replyTo: msg.email,
      subject: `New portfolio message from ${msg.name}`,
      text: `From: ${msg.name} (${msg.email})\n\n${msg.message}`,
    });
  } catch (err) {
    // Don't fail the request just because the email didn't send —
    // the message is already saved in the database.
    console.error('Email notification failed:', err.message);
  }
}

// POST /api/contact — public, called by the contact form
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email, and message are all required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'please provide a valid email address.' });
    }
    if (name.length > 100 || message.length > 5000) {
      return res.status(400).json({ error: 'name or message is too long.' });
    }

    const saved = await Message.create({ name, email, message });
    notifyByEmail(saved); // fire-and-forget, doesn't block the response

    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Contact submission error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

// Simple shared-secret check for admin routes.
// Not a full auth system — fine for a single-owner portfolio admin page.
function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
}

// GET /api/messages — admin only, returns all messages newest first
router.get('/messages', requireAdminKey, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('Fetch messages error:', err.message);
    res.status(500).json({ error: 'Could not fetch messages.' });
  }
});

// PATCH /api/messages/:id/read — admin only, marks a message as read
router.patch('/messages/:id/read', requireAdminKey, async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Message not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Could not update message.' });
  }
});

// DELETE /api/messages/:id — admin only
router.delete('/messages/:id', requireAdminKey, async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Message not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete message.' });
  }
});

module.exports = router;
