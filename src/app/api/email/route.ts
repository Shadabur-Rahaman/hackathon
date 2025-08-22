import { NextRequest, NextResponse } from 'next/server';
import type { EmailData } from '../../../lib/email-service';
import nodemailer from 'nodemailer';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailData = await request.json();

    if (!emailData.to || !emailData.subject || !emailData.html) {
      return NextResponse.json(
        { error: 'Missing required email fields' },
        { status: 400 }
      );
    }

    const transporter = createTransport();

    if (!transporter) {
      console.warn('[Email] SMTP env not configured. Simulating send.');
      console.info('Simulated email:', {
        to: emailData.to,
        subject: emailData.subject,
        preview: emailData.text || emailData.html?.slice(0, 100),
      });
      return NextResponse.json({ success: true, simulated: true }, { status: 200 });
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER as string;

    const info = await transporter.sendMail({
      from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });

    return NextResponse.json(
      { success: true, messageId: info.messageId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
