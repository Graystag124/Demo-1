import { NextResponse } from 'next/server';
import { sendEmail } from '@/utils/email';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Send email to admin
    await sendEmail(
      process.env.ADMIN_EMAIL || 'admin@example.com',
      'New Contact Form Submission',
      `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    );

    // Send confirmation email to user
    await sendEmail(
      email,
      'Thank you for contacting us',
      `
        <h2>Thank you for your message, ${name}!</h2>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <p>Best regards,<br>Your Team</p>
      `
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
