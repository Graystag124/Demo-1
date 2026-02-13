import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;
    const { id } = await params;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Fetch submission details
    const { data: submission, error: subError } = await supabase
      .from('ContactSubmission')
      .select('*')
      .eq('id', id)
      .single();

    if (subError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // 2. Configure Hostinger SMTP 
    // FIX: Use SMTP_USER and SMTP_FROM_EMAIL to match your .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, 
      auth: {
        user: process.env.SMTP_USER, // Matches your .env
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Send the email
    await transporter.sendMail({
      from: `"Byberr Support" <${process.env.SMTP_FROM_EMAIL}>`, // Matches your .env
      to: submission.email,
      replyTo: process.env.SMTP_FROM_EMAIL,
      subject: `Re: Your Inquiry - Byberr Support`,
      text: `Hello ${submission.firstName},\n\nOur response: ${message}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #333;">Hello ${submission.firstName},</h2>
          <p>Thank you for reaching out to Byberr. Here is our response:</p>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Original Message: <i>"${submission.message}"</i></p>
          <hr />
          <p style="font-size: 12px; color: #666;">Byberr Support Team</p>
        </div>
      `,
    });

    // 4. Update the submission status to 'resolved'
    // This ensures the UI updates to "Completed" after the email is sent
    const { error: updateError } = await supabase
      .from('ContactSubmission')
      .update({ 
        status: 'resolved',
        resolvedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) console.error('DB Update Error:', updateError);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('SMTP Error Detail:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}