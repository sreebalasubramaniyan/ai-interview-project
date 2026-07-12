# Get Free Domain & Verify with Resend

## Step 1: Get a Free Domain

### Option A: Freenom (Recommended - .tk, .ml, .ga, .cf, .gq)
1. Go to https://www.freenom.com
2. Search for a name you want (e.g., `myinterview`)
3. Select a free extension (e.g., `.tk`)
4. Click "Get It Now"
5. Complete registration (use your real email)
6. Select "Free" for 12 months
7. Complete order

### Option B: Cloudflare (More Professional)
1. Go to https://cloudflare.com
2. Sign up
3. Enter a domain name they offer (limited availability)
4. They provide a free domain

---

## Step 2: Verify Domain with Resend

1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your free domain (e.g., `myinterview.tk`)
4. Resend will show DNS records:

### Add These to Freenom:

**TXT Record:**
- Name: `@`
- Type: `TXT`
- TTL: `3600`
- Value: `v=spf1 include:_spf.resend.com ~all`

**MX Records (for email receiving - optional):**
- If shown by Resend, add them

5. **Important:** After adding DNS, go back to Freenom DNS settings and add:

**SPF Record (for sending emails):**
- Name: `@`
- Type: `TXT`
- Value: `v=spf1 include:_spf.resend.com ~all`

**DKIM Record (optional):**
- Resend may provide a DKIM key to add

6. **Wait 5-30 minutes** for verification
7. Refresh Resend - should show "Verified"

---

## Step 3: Update Code

Once verified, update the email service:

```javascript
// Change from address:
from: 'AI Interview <noreply@yourdomain.tk>'
```

---

## Quick Guide by Platform

### Freenom:
1. Login → Services → My Domains
2. Click "Manage Domain" → "Manage DNS"
3. Add TXT record for SPF
4. Wait for verification

### Cloudflare:
1. Go to DNS settings
2. Add the TXT records Resend provides
3. Much faster verification (usually 5 min)

---

## Need Help?

Once you get the domain, let me know and I'll help you:
1. Add the DNS records
2. Verify with Resend
3. Update the code

**Go get a free domain now!** → https://www.freenom.com