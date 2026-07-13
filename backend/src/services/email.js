const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  const msg = {
    to: interview.intervieweeEmail,
    from: process.env.EMAIL_USER || 'noreply@aiinterview.com',
    subject: `Interview Scheduled: ${interview.questionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3b82f6;">AI Coding Interview</h2>

        <p>Hello ${interview.intervieweeName},</p>

        <p>You have been scheduled for a coding interview. Here are the details:</p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Question:</strong> ${interview.questionTitle}</p>
          <p><strong>Date & Time:</strong> ${scheduledDate}</p>
          <p><strong>Duration:</strong> ${interview.duration} minutes</p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">

        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px; color: #92400e;">🎯 Your Access Credentials</h3>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${interview.intervieweeEmail}</p>
          <p style="margin: 10px 0;"><strong>Secret Code:</strong> <span style="font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${interview.secretCode}</span></p>
          <p style="margin: 15px 0 0; color: #92400e; font-size: 14px;">Keep these credentials safe. You'll need them to access the interview.</p>
        </div>

        <p>To start your interview at the scheduled time, click the button below:</p>

        <a href="${interviewLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Go to Interview Portal
        </a>

        <p style="margin-top: 20px;">Or copy this link:</p>
        <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${interviewLink}
        </p>

        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
          Note: You can only access the interview at the scheduled time. Use your email and secret code to log in.
        </p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error: error.message };
  }
};

// Send interview results email to admin
const sendResultsToAdmin = async (interview) => {
  const msg = {
    to: process.env.ADMIN_EMAIL || 'admin@aiinterview.com',
    from: process.env.EMAIL_USER || 'noreply@aiinterview.com',
    subject: `Interview Completed: ${interview.intervieweeName} - ${interview.questionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Interview Completed</h2>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Interviewee:</strong> ${interview.intervieweeName}</p>
          <p><strong>Email:</strong> ${interview.intervieweeEmail}</p>
          <p><strong>Question:</strong> ${interview.questionTitle}</p>
          <p><strong>Language:</strong> ${interview.result?.language || 'N/A'}</p>
          <p><strong>Status:</strong> <span style="color: ${interview.result?.status === 'passed' ? '#10b981' : '#dc2626'}; font-weight: bold;">${interview.result?.status || 'pending'}</span></p>
        </div>

        <p>Log in to the admin dashboard to view the full submission and code.</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Results email sent to admin');
    return { success: true };
  } catch (error) {
    console.error('Error sending results email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInterviewInvitation,
  sendResultsToAdmin
};