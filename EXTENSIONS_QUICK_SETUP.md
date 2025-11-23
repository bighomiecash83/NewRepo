# DMF Music Platform — Extensions Setup Checklist

## Quick Start (Copy-Paste Commands)

### 1. Install Image Resizing Extension

```bash
cd backend/functions
firebase ext:install firebase/storage-resize-images --project dmf-music-platform
```

**During installation, answer:**
```
Cloud Storage bucket: dmf-music-platform.appspot.com
Sizes: 200x200,600x600,1200x1200
Output dir: resized_images
Input dir: uploads/covers
Delete original: No
```

### 2. Install Email Extension (SendGrid)

**FIRST: Get SendGrid API Key**
1. Go to https://sendgrid.com (sign up if needed)
2. Settings → API Keys → Create API Key (Mail Send permission)
3. Copy the key

**THEN: Install extension**

```bash
firebase ext:install firebase/firestore-send-email --project dmf-music-platform
```

**During installation, answer:**
```
Firestore collection: mail
SendGrid API Key: [paste your key here]
Default FROM email: no-reply@dmf-music-platform.com
Default FROM name: DMF Music Platform
```

### 3. Set Up Monitoring Dashboard

**In Google Cloud Console:**

1. Go to https://console.cloud.google.com → Select `dmf-music-platform`
2. Monitoring → Dashboards → + CREATE DASHBOARD
3. Name: `DMF Functions Performance`
4. Add Chart:
   - Metric: Cloud Functions > Function > Execution count
   - Filter: metric.labels.status="failed"
   - Aggregator: RATE(sum)
   - Group By: resource.labels.function_name
   - Title: "Error Rate"
5. Add Chart:
   - Metric: Cloud Functions > Function > Execution time
   - Aggregator: mean
   - Group By: resource.labels.function_name
   - Title: "Latency (ms)"

### 4. Set Up Alerts

**Alert 1: High Error Rate**
- Alerting → + CREATE POLICY
- Condition: `cloudfunctions.googleapis.com/function/execution_count` with `status="failed"`
- RATE(sum) > 0.01 per 1 minute
- Notification: Create email channel or use Slack

**Alert 2: High Latency**
- Alerting → + CREATE POLICY
- Condition: `cloudfunctions.googleapis.com/function/execution_time`
- mean > 1000 ms per 5 minutes
- Notification: Same channel as Alert 1

### 5. Deploy & Test

```bash
# Deploy functions (includes email service)
firebase deploy --only functions --project dmf-music-platform

# Test email (add to Firestore manually or via function call)
# In your code:
const { sendArtistOnboardingEmail } = require('./services/emailService');
await sendArtistOnboardingEmail('test@example.com', 'Test Artist', 'https://dmf-music-platform.com/login');

# Test image resizing (upload to Cloud Storage)
# Upload file to: gs://dmf-music-platform.appspot.com/uploads/covers/test.jpg
# Check for resized versions in: gs://dmf-music-platform.appspot.com/resized_images/
```

---

## Files in Place

✅ `firebaseExtensions.config.js` — Configuration reference
✅ `backend/functions/services/emailService.js` — Email helpers
✅ `backend/functions/services/storageService.js` — Storage helpers
✅ `EXTENSIONS_AND_MONITORING.md` — Full guide
✅ **This checklist** — Quick reference

---

## Next: Integrate into Your API

Example: Artist signup endpoint with email

```js
// backend/functions/artists.js
const express = require('express');
const admin = require('firebase-admin');
const { sendArtistOnboardingEmail } = require('./services/emailService');

const router = express.Router();
const db = admin.firestore();

router.post('/signup', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Save to database
    const doc = await db.collection('artists').add({
      email, name, createdAt: new Date()
    });
    
    // Send welcome email
    await sendArtistOnboardingEmail(
      email, name,
      `https://dmf-music-platform.com/activate?id=${doc.id}`
    );
    
    res.status(201).json({ id: doc.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'signup failed' });
  }
});

module.exports = router;
```

---

## Verification

- [ ] Extensions installed (check Firebase Console > Extensions)
- [ ] Firestore `mail` collection created
- [ ] Cloud Storage buckets visible
- [ ] Monitoring dashboard shows function metrics
- [ ] Email service called successfully (check SendGrid Mail Activity)
- [ ] Image uploaded to `uploads/covers/` → resized versions created
- [ ] Alerts configured and notification channel active

---

## Support

- **Image resizing issues**: Check Cloud Build logs
- **Email not sending**: Check SendGrid Mail Activity dashboard
- **Metrics not showing**: Wait 1-2 min, then refresh monitoring
- **Extension help**: `firebase ext:info firebase/storage-resize-images`

**You're now fully automated!** 🚀
