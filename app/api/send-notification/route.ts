import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, message, amount, manualName, receiptUrl, timestamp } = body;
    const timeString = timestamp || new Date().toLocaleString();

    // Check if credentials are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('GMAIL_USER or GMAIL_APP_PASSWORD is not set. Skipping email notification.');
      return NextResponse.json({ success: false, message: 'Email credentials not configured.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"UIP Admin" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to the admin email
      subject: `UIP Alert: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #0b1727; padding: 20px; text-align: center;">
            <h1 style="color: #00d2ff; margin: 0; font-size: 24px;">UNIQUE INCOME PLANE</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0;">${title}</h2>
            <p style="color: #555555; font-size: 16px; line-height: 1.5;">${message}</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> $${amount}</p>
              <p style="margin: 5px 0; color: #333;"><strong>User:</strong> ${manualName}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Type:</strong> ${type}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${timeString}</p>
            </div>
            ${receiptUrl ? \`
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #333; font-weight: bold; margin-bottom: 10px;">Attached Screenshot:</p>
              <a href="\${receiptUrl}" target="_blank">
                <img src="\${receiptUrl}" alt="Receipt Screenshot" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #ddd;" />
              </a>
            </div>
            \` : ''}
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://trx-50h0k8edy-kiyani-s-projects.vercel.app'}/admin/payments" style="background-color: #00d2ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">View in Admin Panel</a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #888888; font-size: 12px;">
            This is an automated notification. Please do not reply to this email.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
