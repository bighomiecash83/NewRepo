# MongoDB Brain Vault - Quick Reference Card

**Print This** | **Keep Handy**

---

## 🧠 THE URI (The Most Important Thing)

```
mongodb+srv://bighomiecash8346:YOUR_PASSWORD@dmf-music-platform.pfqrhc.mongodb.net/dmf_music_platform
```

**Never change this.** All backends use this exact URI.

---

## ⚡ 60-Second Deployment

```bash
cd dmf-music-platform/functions

npm install mongodb

firebase functions:config:set \
  dmf.mongodb_uri="mongodb+srv://bighomiecash8346:PASSWORD@..."

npm run build && npm run deploy
```

Done. ✅

---

## 📍 Collections Cheat Sheet

| Name | Purpose | Key Field |
|------|---------|-----------|
| **royaltyProfiles** | Artist enrollment | artistId |
| **releases** | Release metadata | releaseId |
| **artists** | Artist master | artistId |
| **enrollmentTasks** | Async tasks | taskId |
| **releases_gate_logs** | Debug trail | releaseId |
| **payouts** | Payments (Phase 2) | payoutId |
| **campaigns** | Marketing (Phase 2) | campaignId |
| **streamgod_brain_data** | AI (Phase 4) | releaseId |

---

## 🔗 How Each Backend Connects

**Firebase**:
```ts
const db = await getDb();  // Connects via mongoClient.ts
```

**Lovable**:
```ts
const db = await getDb();  // Connects via environment MONGODB_URI
```

**Both**: Same URI, same database, same collections.

---

## 🚀 Endpoints (All 5 Live)

```
GET    /getRoyaltyProfile?artistId=...
POST   /saveRoyaltyProfile
DELETE /deleteRoyaltyProfile?artistId=...
GET    /canPublishRelease?releaseId=...
GET    /getReleaseStatus?releaseId=...
```

---

## 🛠️ Troubleshooting 30-Second Checklist

| Problem | Fix |
|---------|-----|
| Connection timeout | Check IP whitelisting in MongoDB Atlas |
| Auth failed | Verify password has no special chars (or URL-encode) |
| Module not found | `npm install mongodb` |
| Firebase config missing | `firebase functions:config:set dmf.mongodb_uri="..."` |
| Slow queries | Create indexes: `db.collection.createIndex({field: 1})` |

---

## 📊 Test Data for Quick Setup

```bash
mongosh "mongodb+srv://bighomiecash8346:PASSWORD@..."

db.royaltyProfiles.insertOne({
  artistId: "test-123",
  legalFirstName: "Test",
  legalLastName: "Artist",
  email: "test@example.com",
  consent: { royaltyLockInEnabled: true },
  enrollmentStatuses: [{ 
    org: "BMI", 
    scope: "Writer", 
    status: "Completed" 
  }],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 📋 Implementation Checklist

- [ ] MongoDB URI saved securely
- [ ] Firebase config set: `dmf.mongodb_uri`
- [ ] `npm install mongodb`
- [ ] `npm run build` passes
- [ ] `firebase deploy --only functions`
- [ ] Create test data in MongoDB
- [ ] Test GET endpoint → returns data
- [ ] Test POST endpoint → saves to MongoDB
- [ ] Test DELETE endpoint → removes from MongoDB
- [ ] Lovable backend configured with same URI
- [ ] Both backends tested connecting to MongoDB
- [ ] Frontend successfully calling endpoints

---

## 🔐 Security Reminders

- ❌ Never commit the password to code
- ✅ Use `firebase functions:config:set` to store it
- ✅ Use environment variables in Lovable
- ✅ Both backends authenticate to MongoDB with same user
- ✅ Application-level RBAC enforces who can access what

---

## 📚 Full Docs (When You Need Details)

| File | When to Read |
|------|--------------|
| `MONGODB_ARCHITECTURE.md` | "What collections exist?" |
| `FIREBASE_MONGODB_SETUP.md` | "How do I deploy Firebase?" |
| `LOVABLE_BACKEND_SETUP.md` | "How do I set up Lovable?" |
| `FRONTEND_INTEGRATION_GUIDE.md` | "How do I call from frontend?" |

---

## 🎯 Phase Summary

**NOW (Phase 1)**: Royalty Lock-In ✅ Complete

**LATER (Phase 2)**: Notifications, Webhooks, Admin Dashboard

**LATER (Phase 3)**: DSP Distribution

**LATER (Phase 4)**: StreamGod Brain AI

All phases use **same MongoDB database**. No migration needed.

---

## 💬 Key Quotes

> "Single source of truth for all DMF data"

> "Both Firebase and Lovable read/write to same MongoDB"

> "No sync issues between backends"

> "One connection string. All services."

---

## 🚀 Deploy Status

| Component | Status |
|-----------|--------|
| MongoDB Cluster | ✅ Created |
| Collections | ✅ Designed |
| Firebase Functions | ✅ Updated |
| Lovable Setup | ✅ Documented |
| Security | ✅ Configured |
| Documentation | ✅ Complete |
| **Ready to Deploy** | **✅ YES** |

---

**Last Updated**: November 17, 2025

**Print this card. Keep it near your workspace.**
