// Email service for handling account management and notifications
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ExportData {
  format: 'pdf' | 'docx' | 'txt' | 'html';
  content: string;
  filename: string;
}

class EmailService {
  private apiUrl = '/api/email';

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Email failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${window.location.origin}/auth/reset-password?token=${resetToken}`;
    
    const emailData: EmailData = {
      to: email,
      subject: 'Password Reset Request - CollaboDoc',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your CollaboDoc account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <p>Best regards,<br>The CollaboDoc Team</p>
        </div>
      `,
      text: `Password Reset Request\n\nClick here to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`
    };

    return this.sendEmail(emailData);
  }

  async sendAccountUpdateEmail(email: string, updateType: string): Promise<boolean> {
    const emailData: EmailData = {
      to: email,
      subject: `Account ${updateType} - CollaboDoc`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Account ${updateType}</h2>
          <p>Hello,</p>
          <p>Your CollaboDoc account has been successfully ${updateType.toLowerCase()}.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p>Best regards,<br>The CollaboDoc Team</p>
        </div>
      `,
      text: `Account ${updateType}\n\nYour account has been successfully ${updateType.toLowerCase()}.`
    };

    return this.sendEmail(emailData);
  }

  async sendDataExportEmail(email: string, exportData: ExportData): Promise<boolean> {
    const emailData: EmailData = {
      to: email,
      subject: `Data Export - ${exportData.filename}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Data Export Complete</h2>
          <p>Hello,</p>
          <p>Your data export has been completed successfully.</p>
          <p><strong>File:</strong> ${exportData.filename}</p>
          <p><strong>Format:</strong> ${exportData.format.toUpperCase()}</p>
          <p>The file is attached to this email.</p>
          <p>Best regards,<br>The CollaboDoc Team</p>
        </div>
      `,
      text: `Data Export Complete\n\nFile: ${exportData.filename}\nFormat: ${exportData.format.toUpperCase()}`
    };

    return this.sendEmail(emailData);
  }
}

export const emailService = new EmailService();
