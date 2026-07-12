# Email Feature - Fresh Plan

## Current Status
❌ Email feature removed due to Gmail App Password issues

---

## Issue Summary
The previous attempt used Gmail with App Password but failed with:
- Error: `535 Authentication failed`
- Possible causes: Wrong password, 2-Step not enabled, wrong account

---

## Options for Email

### Option 1: Gmail with App Password (Recommended if fixed)
- Continue using Gmail but fix the App Password issue
- Requires proper setup

### Option 2: Use a Dedicated Email Service (Easier)
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5,000 emails/month
- **Resend** - Free tier: 3,000 emails/month

### Option 3: Use Ethereal (Testing Only)
- Fake email service for testing
- Emails go to a web preview

---

## Recommended Approach: Resend

**Resend** is the easiest to set up:

1. Go to https://resend.com
2. Sign up (free)
3. Add your domain or use their test domain
4. Get API key
5. Install: `npm install resend`
6. Send emails with a few lines of code

---

## Implementation Steps (when ready)

### 1. Install Resend
```bash
npm install resend
```

### 2. Create Email Service
```javascript
// backend/src/services/email.js
const { Resend } = require('resend');

const resend = new Resend('re_123456789');

const sendInterviewInvitation = async (interview) => {
  const interviewLink = `${process.env.FRONTEND_URL}/interview/${interview.accessToken}`;

  await resend.emails.send({
    from: 'AI Interview <onboarding@resend.dev>',
    to: interview.intervieweeEmail,
    subject: `Interview Scheduled: ${interview.questionTitle}`,
    html: `...email content...`
  });
};
```

### 3. Update .env
```
RESEND_API_KEY=re_123456789
```

### 4. Update Routes to Send Email
- Import and call the email service when interview is created

---

## Decision Needed

Which email service would you like to use?

1. **Resend** (recommended - easiest)
2. **SendGrid**
3. **Mailgun**
4. **Try Gmail again** (need correct App Password)

Let me know your choice and I'll implement it!