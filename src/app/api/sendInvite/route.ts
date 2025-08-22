import { NextRequest, NextResponse } from 'next/server';
import { createShareLink } from '@/lib/share';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { documentId, email, role = 'viewer' } = await req.json();

  if (!email || !documentId)
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

  /* 1. create or update row in doc_shares and get URL */
  const url = await createShareLink(documentId, role);

  /* 2. send mail */
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: '"Dodoc" <no-reply@dodoc.com>',
    to: email,
    subject: 'You’ve been invited to collaborate on a document',
    html: `
      <p>Hello,</p>
      <p>${role === 'viewer' ? 'View' : 'Edit'} the document by clicking the link below:</p>
      <p><a href="${url}" target="_blank">${url}</a></p>
      <p>This link will open the document inside Dodoc and connect you to the real-time session.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
