const express = require('express');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Contact form API endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !message || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required including reCAPTCHA verification'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // Email 1: Contact submission to info@lightinuputah.com
    const contactSubmissionEmail = {
      to: 'info@lightinuputah.com',
      from: 'info@lightinuputah.com',
      replyTo: email,
      subject: `New Contact: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">
            This message was sent from the Lightin Up Utah contact form. 
            You can reply directly to this email to respond to ${name}.
          </p>
        </div>
      `
    };

    // Email 2: Receipt confirmation to customer
    const customerReceiptEmail = {
      to: email,
      from: 'info@lightinuputah.com',
      replyTo: 'info@lightinuputah.com',
      subject: 'Thanks for contacting Lightin Up Utah!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for contacting Lightin Up Utah!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to us about your LED lighting project. We've received your message and will get back to you as soon as possible.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <p>We typically respond within 24 hours during business days. If you have any urgent questions, feel free to reach out to us directly.</p>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1976d2;">Contact Information:</h4>
            <p style="margin: 5px 0;"><strong>Email:</strong> info@lightinuputah.com</p>
            <p style="margin: 5px 0;"><strong>Instagram:</strong> <a href="https://www.instagram.com/lightinuputah/" style="color: #1976d2;">@lightinuputah</a></p>
            <p style="margin: 5px 0;"><strong>Location:</strong> Salt Lake City, Utah</p>
          </div>
          
          <p>Best regards,<br>Braden<br><strong>Lightin Up Utah</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated confirmation email. Please do not reply to this message.
            To contact us, please reply to info@lightinuputah.com or use our contact form.
          </p>
        </div>
      `
    };

    // Send both emails
    await Promise.all([
      sgMail.send(contactSubmissionEmail),
      sgMail.send(customerReceiptEmail)
    ]);

    console.log(`Contact form submitted successfully for ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Check if it's a SendGrid error
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Contact form API available at http://localhost:${PORT}/api/contact`);
}); 