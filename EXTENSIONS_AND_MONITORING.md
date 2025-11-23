# DMF Music Platform — Extensions & Monitoring Setup

## Overview

This guide walks through setting up three critical automation features:
1. **Monitoring Dashboard** — Track Cloud Functions performance
2. **Image Resizing** — Auto-generate cover art thumbnails
3. **Email Automation** — Send notifications via SendGrid

---

## 1. Monitoring Dashboard (Google Cloud Monitoring)

### Step 1: Access Google Cloud Monitoring

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `dmf-music-platform`
3. Navigate to **Monitoring** (search or use sidebar)

### Step 2: Create Custom Dashboard

1. Click **Dashboards** → **+ CREATE DASHBOARD**
2. Name it: `DMF Functions Performance`
3. Add two charts:

#### Chart 1: Function Error Rate

```
Chart Type: Line
Metric: Cloud Functions > Function > Execution count
Filter: metric.labels.status="failed"
Group By: resource.labels.function_name
Aggregator: RATE(sum) over 1 minute
Title: "Error Rate (failures/min)"
```

#### Chart 2: Function Latency

```
Chart Type: Line
Metric: Cloud Functions > Function > Execution time
Filter: resource.type="cloud_function"
Group By: resource.labels.function_name
Aggregator: mean
Title: "Average Execution Time (ms)"
```

### Step 3: Set Up Alerts

**Alert 1: High Error Rate**

1. Go to **Alerting** → **+ CREATE POLICY**
2. Condition:
   ```
   Metric: cloudfunctions.googleapis.com/function/execution_count
   Filter: metric.labels.status="failed"
   Aggregator: RATE(sum)
   Time Window: 1 minute
   Comparison: > (Greater than)
   Threshold: 0.01 (1 error per 100 invocations)
   ```
3. Notification: Create or select email/Slack channel
4. Save as: "High Function Error Rate"

**Alert 2: High Latency**

1. Go to **Alerting** → **+ CREATE POLICY**
2. Condition:
   ```
   Metric: cloudfunctions.googleapis.com/function/execution_time
   Filter: resource.type="cloud_function"
   Aggregator: mean
   Time Window: 5 minutes
   Comparison: > (Greater than)
   Threshold: 1000 (milliseconds)
   ```
3. Notification: Same email/Slack channel
4. Save as: "High Function Latency"

### Verification

Once alerts are active, test by making requests to your Cloud Functions. Metrics should appear within a few minutes.

---

## 2. Image Resizing Extension (Firebase Storage)

### Prerequisites

- Cloud Storage bucket: `dmf-music-platform.appspot.com` (created automatically with Firebase)
- Admin SDK initialized in your functions (already done)

### Installation

```bash
cd backend/functions
firebase ext:install firebase/storage-resize-images --project dmf-music-platform
```

### Configuration Prompts

Answer as follows:

```
1. Cloud Storage bucket: dmf-music-platform.appspot.com
2. Sizes of resized images: 200x200,600x600,1200x1200
3. Output directory for resized images: resized_images
4. Input directory for images (optional): uploads/covers
5. Delete original file: No
```

### How It Works

1. Upload cover art to: `gs://dmf-music-platform.appspot.com/uploads/covers/my-cover.jpg`
2. Extension automatically creates:
   - `gs://.../resized_images/my-cover_200x200.jpg` (thumbnail)
   - `gs://.../resized_images/my-cover_600x600.jpg` (web display)
   - `gs://.../resized_images/my-cover_1200x1200.jpg` (high-res)

### In Your Functions Code

Use the `storageService.js` helper:

```js
const { getResizedImageUrls } = require('./services/storageService');

// In an endpoint:
const urls = getResizedImageUrls('my-cover');
// urls = {
//   '200x200': 'https://storage.googleapis.com/dmf-music-platform.appspot.com/resized_images/my-cover_200x200.jpg',
//   '600x600': '...',
//   '1200x1200': '...'
// }
```

---

## 3. Email Automation Extension (SendGrid)

### Prerequisites

- SendGrid account with API key
- Firestore enabled (auto-enabled with Firebase)

### Step 1: Get SendGrid API Key

1. Create a [SendGrid account](https://sendgrid.com) (free tier available)
2. Go to **Settings** → **API Keys**
3. Create a new API key with "Mail Send" permissions
4. Copy the key (you'll only see it once)

### Step 2: Install Extension

```bash
cd backend/functions
firebase ext:install firebase/firestore-send-email --project dmf-music-platform
```

### Configuration Prompts

Answer as follows:

```
1. Cloud Firestore collection for mail: mail
2. SendGrid API Key: [paste your key]
3. Default FROM email: no-reply@dmf-music-platform.com
4. Default FROM name: DMF Music Platform
```

### How It Works

Write a document to Firestore `mail` collection → Extension automatically sends email via SendGrid.

### Usage in Cloud Functions

```js
const { sendArtistOnboardingEmail } = require('./services/emailService');

// When artist signs up:
await sendArtistOnboardingEmail(
  'artist@example.com',
  'The Superstars',
  'https://dmf-music-platform.com/login'
);
```

### Available Email Templates (in `emailService.js`)

1. **`sendSimpleEmail(to, subject, html)`** — Generic HTML email
2. **`sendArtistOnboardingEmail(email, name, loginUrl)`** — Welcome new artist
3. **`sendPayoutNotification(email, name, amount, date)`** — Payout alert
4. **`sendTrackUploadConfirmation(email, name, trackName)`** — Track live alert

### Custom Templates with SendGrid

For branded emails, create templates in SendGrid:

1. Go to SendGrid Dashboard → **Dynamic Templates**
2. Create a new template (e.g., "Artist Onboarding")
3. Get the template ID
4. Use in code:

```js
const { sendTemplateEmail } = require('./services/emailService');

await sendTemplateEmail(
  'artist@example.com',
  'd-YOUR_TEMPLATE_ID',
  {
    artistName: 'The Superstars',
    loginLink: 'https://dmf-music-platform.com/login'
  }
);
```

---

## 4. Integration Example: Artist Signup Flow

Wire it all together in a Cloud Function:

```js
// In backend/functions/artistSignup.js
const express = require('express');
const admin = require('firebase-admin');
const { sendArtistOnboardingEmail } = require('./services/emailService');
const router = express.Router();

const db = admin.firestore();

router.post('/artists', async (req, res) => {
  try {
    const { email, name } = req.body;

    // 1. Save to Firestore
    const doc = await db.collection('artists').add({
      email,
      name,
      createdAt: new Date(),
    });

    // 2. Send welcome email
    await sendArtistOnboardingEmail(
      email,
      name,
      `https://dmf-music-platform.com/login?id=${doc.id}`
    );

    res.status(201).json({ id: doc.id, email, name });
  } catch (err) {
    console.error('Artist signup error:', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
```

---

## 5. Verification Checklist

After setup:

- [ ] **Monitoring Dashboard**: See charts at Google Cloud Console > Monitoring > Dashboards
- [ ] **Image Resizing**: Upload file to `uploads/covers/` → Check `resized_images/` for versions
- [ ] **Email**: Add document to Firestore `mail` collection → Check email inbox (may take 1-2 min)
- [ ] **Error Alerts**: Make a request to your functions → Should see metrics in 1-2 minutes
- [ ] **Email in Functions**: Call `sendArtistOnboardingEmail()` → Should receive email

---

## 6. Costs & Limits

| Feature | Free Tier | Typical Cost |
|---------|-----------|--------------|
| **Monitoring** | First 500 monitored resources | Included |
| **Image Resizing** | Included (uses Cloud Build) | ~$0.002 per image |
| **Email (SendGrid)** | 100 free emails/day | $14.95/month for higher volume |
| **Cloud Storage** | 5 GB free | $0.020/GB after |
| **Firestore** | 1 GB free reads/writes | $0.06/$0.18 per 100k after |

---

## 7. Troubleshooting

**Emails not arriving:**
- Check SendGrid Dashboard > Mail Activity for bounces
- Verify SendGrid API key is valid
- Ensure `mail` Firestore collection is spelled correctly

**Images not resizing:**
- Check Cloud Functions logs: `firebase functions:log --only=image_resizing`
- Ensure file names are valid (no special chars except `-` and `_`)
- Check Cloud Storage quota/permissions

**Monitoring not showing data:**
- Metrics take 1-2 minutes to appear
- Ensure Cloud Functions are actually being called
- Check Cloud Monitoring API is enabled in Google Cloud Console

---

## Next Steps

1. **Deploy**: `firebase deploy --only functions`
2. **Test**: Make requests to your API → Metrics should appear in Monitoring dashboard
3. **Customize**: Modify email templates and image sizes as needed
4. **Scale**: Add more alert channels (SMS, PagerDuty, etc.) as needed

You're now fully equipped to automate image processing and send transactional emails to your artists! 🚀
