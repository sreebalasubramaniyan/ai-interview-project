const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Nodemailer as fallback
const createNodemailerTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
      }
    });
  }
  return null;
};

console.log('Email config loaded:');
console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'NOT SET');
console.log('- GMAIL EMAIL_USER:', process.env.EMAIL_USER ? process.env.EMAIL_USER : 'NOT SET');

// Send interview invitation email
const sendInterviewInvitation = async (interview) => {
  const interviewLink = `${process.env.FRONTEND_URL}/interview/${interview.accessToken}`;
  const scheduledDate = new Date(interview.scheduledAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const questionCount = interview.questions?.length || (interview.questionId ? 1 : 0);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #2563eb; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #fff; font-size: 20px;">Coding Interview Invitation</h1>
      </div>

      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #1f2937; font-size: 15px;">Hello ${interview.intervieweeName},</p>

        <p style="color: #4b5563; font-size: 14px;">
          You have been invited to complete a coding interview.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Scheduled Time</td>
            <td style="text-align: right; padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 14px;">${scheduledDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Duration</td>
            <td style="text-align: right; padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 14px;">${interview.duration} minutes</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Questions</td>
            <td style="text-align: right; padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 14px;">${questionCount}</td>
          </tr>
        </table>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: bold;">Your Access Credentials</p>
          <p style="margin: 0; color: #78350f; font-size: 13px;">Email: <strong>${interview.intervieweeEmail}</strong></p>
          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 13px;">Secret Code: <strong style="font-family: monospace; font-size: 16px;">${interview.secretCode}</strong></p>
        </div>

        <a href="${interviewLink}" style="display: block; background: #2563eb; color: #fff; padding: 12px 24px; text-align: center; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
          Start Interview
        </a>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
          Please use your email and secret code to access the interview at the scheduled time.
        </p>
      </div>

      <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} AI Interview Platform
      </p>
    </div>
  `;

  // 1. Try Resend if configured (uses HTTPS port 443 - works on Render)
  if (resend) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'AI Interview <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from: fromEmail,
        to: interview.intervieweeEmail,
        subject: `Interview Invitation - ${scheduledDate}`,
        html: htmlContent
      });

      if (result.error) {
        console.error('Resend error sending invitation:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('Invitation email sent via Resend successfully to:', interview.intervieweeEmail, 'ID:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (err) {
      console.error('Exception sending via Resend:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Fallback to Nodemailer (Gmail)
  const transporter = createNodemailerTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"AI Interview Platform" <${process.env.EMAIL_USER}>`,
        to: interview.intervieweeEmail,
        subject: `Interview Invitation - ${scheduledDate}`,
        html: htmlContent
      });
      console.log('Invitation email sent via Nodemailer to:', interview.intervieweeEmail, 'ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email via Nodemailer:', error.message);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'No email service configured (set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS)' };
};

// Send results to admin
const sendResultsToAdmin = async (interview) => {
  let resultsHtml = '';

  if (interview.bestScores && interview.bestScores.length > 0) {
    resultsHtml = interview.bestScores.map(bs => `
      <p style="margin: 8px 0;">
        <strong>${bs.questionTitle}</strong><br>
        <span style="color: ${bs.passed === bs.total ? '#059669' : '#d97706'};">
          Score: ${bs.passed}/${bs.total} ${bs.passed === bs.total ? '✓' : '⚠'}
        </span>
      </p>
    `).join('');
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #059669; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #fff; font-size: 20px;">Interview Completed</h1>
      </div>

      <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Candidate</td>
            <td style="text-align: right; padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 14px;">${interview.intervieweeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email</td>
            <td style="text-align: right; padding: 8px 0; color: #1f2937; font-size: 14px;">${interview.intervieweeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Completed</td>
            <td style="text-align: right; padding: 8px 0; color: #1f2937; font-size: 14px;">${interview.completedAt ? new Date(interview.completedAt).toLocaleString() : 'N/A'}</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

        <h3 style="color: #1f2937; font-size: 14px; margin: 0 0 12px 0;">Results</h3>
        ${resultsHtml}
      </div>

      <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} AI Interview Platform
      </p>
    </div>
  `;

  // 1. Try Resend if configured
  if (resend) {
    try {
      const fromEmail = process.env.RESEND_FROM || 'AI Interview <onboarding@resend.dev>';
      const result = await resend.emails.send({
        from: fromEmail,
        to: process.env.ADMIN_EMAIL || 'sreebalasubramaniyan682@gmail.com',
        subject: `Interview Completed - ${interview.intervieweeName}`,
        html: htmlContent
      });

      if (result.error) {
        console.error('Resend error sending results email:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('Results email sent via Resend to admin. ID:', result.data?.id);
      return { success: true, messageId: result.data?.id };
    } catch (err) {
      console.error('Exception sending results via Resend:', err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Fallback to Nodemailer
  const transporter = createNodemailerTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"AI Interview Platform" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Interview Completed - ${interview.intervieweeName}`,
        html: htmlContent
      });
      console.log('Results email sent to admin via Nodemailer. ID:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending results email:', error.message);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: 'No email service configured' };
};

module.exports = {
  sendInterviewInvitation,
  sendResultsToAdmin
};
