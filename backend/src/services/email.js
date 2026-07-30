const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('Email config loaded');
console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'NOT SET');

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

  const msg = {
    to: interview.intervieweeEmail,
    from: process.env.EMAIL_USER || 'noreply@aiinterview.com',
    subject: `Interview Invitation - ${scheduledDate}`,
    html: `
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
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Invitation email sent to:', interview.intervieweeEmail);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
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

  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.EMAIL_USER || 'noreply@aiinterview.com',
    subject: `Interview Completed - ${interview.intervieweeName}`,
    html: `
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
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Results email sent to admin');
    return { success: true };
  } catch (error) {
    console.error('Error sending results email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendInterviewInvitation,
  sendResultsToAdmin
};
