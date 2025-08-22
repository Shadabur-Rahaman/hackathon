import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, documentTitle, emails, role, inviterName } = await req.json();

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send invitations to all emails
    const invitePromises = emails.map(async (email: string) => {
      // Generate unique invite token
      const inviteToken = nanoid(32);
      const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/doc/${documentId}?invite=${inviteToken}&role=${role}`;

      // Store invitation in database
      await supabase.from('document_invitations').insert({
        document_id: documentId,
        inviter_id: userId,
        invitee_email: email,
        role: role,
        invite_token: inviteToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });

      // Send email
      await transporter.sendMail({
        from: `"${inviterName} via Dodoc" <noreply@${process.env.EMAIL_DOMAIN}>`,
        to: email,
        subject: `You're invited to collaborate on "${documentTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #6366f1; margin: 0;">Dodoc</h1>
              <p style="color: #666; font-size: 16px;">Real-time collaborative editor</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-top: 0;">You've been invited to collaborate!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to ${role === 'editor' ? 'edit' : 'view'} the document:
              </p>
              <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin: 20px 0;">
                "${documentTitle}"
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="display: inline-block; background: #6366f1; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                🚀 Open Document
              </a>
            </div>

            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                <strong>💡 Getting Started:</strong><br>
                • Click the button above to access the document<br>
                • Sign in or create an account (it's free!)<br>
                • Start collaborating in real-time with live cursors<br>
                • Your changes are automatically saved
              </p>
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This invitation expires in 7 days. If you have any questions, 
                <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #6366f1;">contact support</a>.
              </p>
            </div>
          </div>
        `,
      });
    });

    await Promise.all(invitePromises);

    return NextResponse.json({ 
      success: true, 
      message: `Invitations sent to ${emails.length} recipients` 
    });

  } catch (error) {
    console.error('Email invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' }, 
      { status: 500 }
    );
  }
}
