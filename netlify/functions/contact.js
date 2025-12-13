const brevo = require('@getbrevo/brevo');

// Configure Brevo - Check if API key is set
if (!process.env.BREVO_API_KEY) {
  console.error('BREVO_API_KEY is not set in environment variables');
}

// Initialize Brevo API client
const defaultClient = brevo.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Initialize TransactionalEmailsApi
const apiInstance = new brevo.TransactionalEmailsApi();

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

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  try {
    const { name, email, phone, message, recaptchaToken } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !email || !phone || !message || !recaptchaToken) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'All fields are required including reCAPTCHA verification'
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Please provide a valid email address'
        }),
      };
    }

    // Validate phone format (10 digits, numbers only)
    const phoneDigitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneDigitsOnly)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Phone number must be 10 digits with area code (numbers only)'
        }),
      };
    }

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'reCAPTCHA verification failed. Please try again.'
        }),
      };
    }

    // Email 1: Contact submission to info@lightinuputah.com
    const contactSubmissionEmail = new brevo.SendSmtpEmail();
    contactSubmissionEmail.to = [{ email: 'info@lightinuputah.com' }];
    contactSubmissionEmail.sender = { name: 'Lightin Up Utah', email: 'info@lightinuputah.com' };
    contactSubmissionEmail.replyTo = { email: email };
    contactSubmissionEmail.subject = `New Contact: ${name}`;
    contactSubmissionEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phoneDigitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}</p>
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
    `;

    // Email 2: Receipt confirmation to customer
    const customerReceiptEmail = new brevo.SendSmtpEmail();
    customerReceiptEmail.to = [{ email: email }];
    customerReceiptEmail.sender = { name: 'Lightin Up Utah', email: 'info@lightinuputah.com' };
    customerReceiptEmail.replyTo = { email: 'info@lightinuputah.com' };
    customerReceiptEmail.subject = 'Thanks for contacting Lightin Up Utah!';
    customerReceiptEmail.htmlContent = `
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
    `;

    // Send both emails
    await Promise.all([
      apiInstance.sendTransacEmail(contactSubmissionEmail),
      apiInstance.sendTransacEmail(customerReceiptEmail)
    ]);

    console.log(`Contact form submitted successfully for ${name} (${email})`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Message sent successfully!'
      }),
    };

  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a Brevo error
    if (error.response) {
      console.error('Brevo error details:', error.response.body);
    }

    // Check if it's an environment variable issue
    if (!process.env.BREVO_API_KEY) {
      console.error('CRITICAL: BREVO_API_KEY environment variable is not set');
    }
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      console.error('CRITICAL: RECAPTCHA_SECRET_KEY environment variable is not set');
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to send message. Please try again later.'
      }),
    };
  }
}; 