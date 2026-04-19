import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // RSVP API endpoint
  app.post('/api/rsvp', async (req, res) => {
    const { name, attending, favoriteSong, message, plusOne } = req.body;

    // Email notification logic
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL || 'AmberStallings124@gmail.com',
        subject: `New RSVP: ${name} is ${attending ? 'COMING' : 'NOT coming'}!`,
        text: `
          New RSVP Submission:
          
          Name: ${name}
          Attending: ${attending ? 'Yes' : 'No'}
          Plus One: ${plusOne ? 'Yes' : 'No'}
          Karaoke Song: ${favoriteSong || 'N/A'}
          Message: ${message || 'None'}
          
          Sent from your Karaoke Birthday Website.
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Email error:', error);
        // We don't fail the RSVP if email fails, but we log it
      }
    } else {
      console.warn('Email credentials not set. Periodic check of Firestore is recommended.');
    }

    res.json({ success: true, message: 'RSVP processed and notification attempted.' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
