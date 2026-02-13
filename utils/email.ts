import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, html: string) {
  // Create a test account if in development
  const testAccount = process.env.NODE_ENV === 'development' 
    ? await nodemailer.createTestAccount()
    : null;

  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'your-email@example.com',
      pass: process.env.EMAIL_SERVER_PASSWORD || 'your-email-password',
    },
  });

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || 'Your App'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'}>`,
    to,
    subject,
    html,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
}
