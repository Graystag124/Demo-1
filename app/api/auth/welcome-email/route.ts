import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  userType: 'brand' | 'creator';
}

export async function POST(request: Request) {
  try {
    const { email, name, userType }: WelcomeEmailRequest = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; border: 1px solid #e9ecef;">
          <h1 style="color: #1a365d; margin-top: 0; text-align: center;">Welcome to Byberr!</h1>
          
          <p>Hi ${name || 'there'},</p>
          
          <p>We're excited to have you join a platform built to simplify and elevate barter-based influencer collaborations.</p>
          
          <p>Byberr helps lifestyle and experience brands connect effortlessly with authentic creators—making the entire collaboration process feel as easy as booking a reservation.</p>
          
          <h3 style="color: #2d3748; margin: 25px 0 15px 0;">Here's what you can expect:</h3>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">${userType === 'brand' ? 'For Brands' : 'For Creators'}</h4>
            
            ${userType === 'brand' ? `
              <ul style="color: #4a5568; padding-left: 20px; margin: 0;">
                <li>Cost-effective marketing through barter</li>
                <li>Access to verified, high-engagement creators</li>
                <li>Authentic content with performance insights</li>
                <li>Streamlined, booking-style campaign management</li>
              </ul>
            ` : `
              <ul style="color: #4a5568; padding-left: 20px; margin: 0;">
                <li>Complimentary experiences at top restaurants, hotels, travel spots, and activities</li>
                <li>Opportunities to build a strong, authentic content portfolio</li>
                <li>A discovery feed full of new brand collaborations</li>
                <li>A simple and transparent booking process</li>
              </ul>
            `}
          </div>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #90cdf4;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0; font-size: 16px;">Account Status</h4>
            <p style="margin: 0; color: #4a5568;">
              Your signup is complete — please allow some time for admin approval.
              ${userType === 'creator' ? 'Once approved, you\'ll be able to start applying for collaborations.' : 'Once approved, you\'ll be able to start creating campaigns and connecting with creators.'}
            </p>
          </div>
          
          <p>We're thrilled to have you onboard and can't wait to see the collaborations you create!</p>
          
          <p style="margin-top: 30px;">
            Warm regards,<br>
            <strong>Team Byberr</strong>
          </p>
          
          <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; text-align: center;">
            <p>${new Date().getFullYear()} Byberr. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"Byberr Support" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Welcome to Byberr!`,
      html: emailContent,
      text: `
Welcome to Byberr!

Hi ${name || 'there'},

We're excited to have you join a platform built to simplify and elevate barter-based influencer collaborations.

Byberr helps lifestyle and experience brands connect effortlessly with authentic creators—making the entire collaboration process feel as easy as booking a reservation.

Here's what you can expect:

${userType === 'brand' ? `
For Brands:
• Cost-effective marketing through barter
• Access to verified, high-engagement creators
• Authentic content with performance insights
• Streamlined, booking-style campaign management
` : `
For Creators:
• Complimentary experiences at top restaurants, hotels, travel spots, and activities
• Opportunities to build a strong, authentic content portfolio
• A discovery feed full of new brand collaborations
• A simple and transparent booking process
`}

Account Status:
Your signup is complete — please allow some time for admin approval.
${userType === 'creator' ? 'Once approved, you\'ll be able to start applying for collaborations.' : 'Once approved, you\'ll be able to start creating campaigns and connecting with creators.'}

We're thrilled to have you onboard and can't wait to see the collaborations you create!

Warm regards,
Team Byberr

${new Date().getFullYear()} Byberr. All rights reserved.
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    );
  }
}
