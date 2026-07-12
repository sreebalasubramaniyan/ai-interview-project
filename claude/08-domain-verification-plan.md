# How to Send Emails to Any User

## Current Limitation
Resend's free tier only allows sending to your **own verified email**.

## Solution: Verify a Domain

To send to **any email**, you need to verify a domain with Resend.

### Option 1: Verify Your Own Domain (Recommended)

1. **Go to Resend Domains**
   - https://resend.com/domains

2. **Add a Domain**
   - Enter a domain you own (e.g., `yourdomain.com`)
   - If you don't have one, you can get a free domain from:
     - **Cloudflare** (free)
     - **Namecheap** (free for first year)
     - **Freenom** (free .tk, .ml, .ga domains)

3. **Add DNS Records**
   Resend will give you:
   - TXT record for domain verification
   - MX records for email routing

   Add these to your domain's DNS settings (in your domain provider's dashboard).

4. **Wait for Verification**
   - Can take a few minutes to 24 hours
   - You'll see "Verified" status in Resend dashboard

5. **Update the Code**
   - Change the `from` address in email.js to use your domain:
   ```javascript
   from: 'AI Interview <noreply@yourdomain.com>'
   ```

---

### Option 2: Switch to SendGrid (Easier Alternative)

If verifying a domain is too complex, switch to **SendGrid**:

1. Go to https://sendgrid.com
2. Sign up for free account
3. Verify a single sender (easier than domain)
4. Get API key
5. Install: `npm install @sendgrid/mail`
6. Replace Resend with SendGrid in the code

---

### Option 3: Use a Domain You Already Have

If you already own a domain (e.g., for a website), just verify that one!

---

## Decision?

Let me know:
1. Do you have a domain? → I can help verify it
2. Want to get a free domain? → I can guide you
3. Want to switch to SendGrid instead?