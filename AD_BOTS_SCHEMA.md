# AD_BOTS_SCHEMA.md

DMF-MUSIC-PLATFORM – Ad Bot & Campaign Schema (Locked)

## Goal

Give StreamGod and 10,000 bots a clean data structure to:

- Store who each bot is and what they do
- Store ad campaigns, creatives, and results
- Track daily performance and learning
- Keep everything legal and auditable

This schema is designed for **MongoDB Atlas** and integrates with existing collections like:

- `artists`
- `releases`
- `users` / `label_accounts` (owner + team)
- `youtube_channels`, `meta_ad_accounts`, etc. (if already defined)

---

## 1. Collection: `ad_bots`

**One document per bot** (up to 10,000+).

### Example document

```json
{
  "_id": "bot_YT_SHORTS_SCALER_0237",
  "bot_key": "YT_SHORTS_SCALER_0237",
  "name": "YouTube Shorts Scaler 0237",
  "division": "platform_commander",
  "role": "youtube_shorts_scaler",
  "platform": "youtube",
  "status": "active",
  "priority": 5,

  "assigned_artist_ids": ["artist_freezzo_id", "artist_bighomiecash_id"],
  "assigned_label_id": "dmf_label_root",

  "playbook_version": "v1.0",
  "current_playbook_id": "playbook_youtube_shorts_music_v1",

  "last_run_at": "2025-11-19T15:00:00Z",
  "next_run_after": "2025-11-20T00:00:00Z",

  "created_at": "2025-11-01T00:00:00Z",
  "updated_at": "2025-11-19T15:00:00Z"
}
```

### Key fields

* `bot_key` – Stable, human-readable ID ("YOUTUBE_SHORTS_SCALER_0237").
* `division` – One of:
  * `audience_intel`
  * `creative_lab`
  * `platform_commander`
  * `funnel_offer`
  * `budget_optimizer`
  * `analytics`
  * `community`
  * `compliance`
* `role` – Specific job (e.g., `youtube_shorts_scaler`, `meta_creative_tester`).
* `platform` – `youtube`, `meta`, `tiktok`, `google`, `all`, etc.
* `assigned_artist_ids` – Which artist(s) this bot works on.
* `playbook_version` / `current_playbook_id` – Which ruleset it follows.

### Indexes

```js
db.ad_bots.createIndex({ division: 1, role: 1 });
db.ad_bots.createIndex({ platform: 1, status: 1 });
db.ad_bots.createIndex({ assigned_artist_ids: 1 });
db.ad_bots.createIndex({ status: 1, next_run_after: 1 });
```

---

## 2. Collection: `ad_playbooks`

Defines **what a bot is supposed to do** – the rules and logic.

### Example

```json
{
  "_id": "playbook_youtube_shorts_music_v1",
  "name": "YouTube Shorts – Music Growth v1",
  "version": "v1.0",
  "platform": "youtube",
  "division": "platform_commander",
  "roles": ["youtube_shorts_scaler", "youtube_shorts_tester"],

  "objectives": [
    "maximize_watch_time",
    "grow_channel_subscribers",
    "drive_traffic_to_full_music_videos"
  ],

  "kpis": {
    "target_cpv_usd": 0.02,
    "min_watch_percent": 35,
    "min_ctr_percent": 1.5
  },

  "tactics": [
    {
      "name": "shorts_batch_test",
      "description": "Launch 10 shorts with different hooks at low budget, measure 24-hour performance.",
      "steps": [
        "Select top 10 clips from creative library",
        "Launch campaigns with equal budgets",
        "After 24h, mark top 3 by CPV + watch%",
        "Recommend scaling top 3, pause others"
      ]
    }
  ],

  "compliance_rules": [
    "no_misleading_claims",
    "no_explicit_content_in_creatives",
    "respect_youtube_ad_policies"
  ],

  "created_at": "2025-11-01T00:00:00Z",
  "updated_at": "2025-11-10T00:00:00Z",
  "is_active": true
}
```

### Indexes

```js
db.ad_playbooks.createIndex({ platform: 1, division: 1, is_active: 1 });
db.ad_playbooks.createIndex({ version: 1 });
```

---

## 3. Collection: `ad_campaigns`

High-level campaign object tied to an artist and a goal (e.g. "Freezzo – New Single Launch").

### Example

```json
{
  "_id": "camp_freezzo_single_nov2025_youtube",
  "artist_id": "artist_freezzo_id",
  "label_id": "dmf_label_root",

  "name": "Freezzo - 'Cold Truth' Launch - YouTube Push",
  "platform": "youtube",
  "objective": "views_music_video",
  "status": "active",

  "target_countries": ["US", "CA", "UK"],
  "target_cities": ["Columbus", "Atlanta", "Chicago"],
  "age_range": [18, 34],
  "gender": "all",

  "budget_total_usd": 5000,
  "budget_daily_cap_usd": 250,
  "start_date": "2025-11-20",
  "end_date": "2025-12-20",

  "platform_campaign_id": "yt_camp_123456",
  "linked_playbook_id": "playbook_youtube_shorts_music_v1",

  "created_by_user_id": "owner_dmf",
  "created_at": "2025-11-10T00:00:00Z",
  "updated_at": "2025-11-19T00:00:00Z"
}
```

### Indexes

```js
db.ad_campaigns.createIndex({ artist_id: 1, platform: 1, status: 1 });
db.ad_campaigns.createIndex({ start_date: 1, end_date: 1 });
```

---

## 4. Collection: `ad_creatives`

Stores the actual ad assets and variants (hooks, thumbnails, captions).

### Example

```json
{
  "_id": "creative_freezzo_short_hookA_01",
  "artist_id": "artist_freezzo_id",
  "campaign_id": "camp_freezzo_single_nov2025_youtube",
  "platform": "youtube",
  "type": "shorts_video",

  "asset_refs": {
    "video_url": "https://storage.dmf/ads/freezzo/hookA_15s.mp4",
    "thumbnail_url": "https://storage.dmf/ads/freezzo/thumbA.png"
  },

  "headline": "This hook will stay in your head all day.",
  "primary_text": "New heat from Freezzo. Watch the full video now.",
  "cta": "WATCH_NOW",

  "tags": ["hook_A", "city_atlanta", "cold_truth_campaign"],

  "status": "active",
  "created_at": "2025-11-09T00:00:00Z",
  "updated_at": "2025-11-15T00:00:00Z"
}
```

### Indexes

```js
db.ad_creatives.createIndex({ campaign_id: 1, platform: 1, status: 1 });
db.ad_creatives.createIndex({ artist_id: 1, status: 1 });
db.ad_creatives.createIndex({ tags: 1 });
```

---

## 5. Collection: `ad_metrics_daily`

Aggregated performance per day per creative/adset/campaign.

This is where bots **learn** from.

### Example

```json
{
  "_id": "metric_freezzo_short_hookA_2025-11-18",
  "artist_id": "artist_freezzo_id",
  "campaign_id": "camp_freezzo_single_nov2025_youtube",
  "creative_id": "creative_freezzo_short_hookA_01",
  "platform": "youtube",

  "date": "2025-11-18",
  "currency": "USD",

  "spend_usd": 120.5,
  "impressions": 45000,
  "views": 28000,
  "clicks": 2100,
  "conversions": 320,

  "avg_watch_percent": 47.5,
  "ctr_percent": 4.7,
  "cpv_usd": 0.0043,
  "cpc_usd": 0.0574,

  "streams_estimated": 1900,
  "subscribers_gained": 85,

  "data_source": "google_ads_api",
  "imported_at": "2025-11-19T03:00:00Z"
}
```

### Indexes

```js
db.ad_metrics_daily.createIndex({ artist_id: 1, date: -1 });
db.ad_metrics_daily.createIndex({ campaign_id: 1, date: -1 });
db.ad_metrics_daily.createIndex({ creative_id: 1, date: -1 });
```

---

## 6. Collection: `ad_bot_runs`

Logs what each bot actually did every run (for auditing, debugging, and training).

### Example

```json
{
  "_id": "run_bot_YT_SHORTS_SCALER_0237_2025-11-19T02:00:00Z",
  "bot_id": "bot_YT_SHORTS_SCALER_0237",
  "playbook_id": "playbook_youtube_shorts_music_v1",

  "artist_ids": ["artist_freezzo_id"],
  "platform": "youtube",

  "started_at": "2025-11-19T02:00:00Z",
  "finished_at": "2025-11-19T02:00:10Z",

  "actions": [
    {
      "type": "recommend_scale",
      "campaign_id": "camp_freezzo_single_nov2025_youtube",
      "creative_id": "creative_freezzo_short_hookA_01",
      "reason": "cpv_usd < 0.01 AND avg_watch_percent > 45",
      "suggested_budget_increase_percent": 25
    },
    {
      "type": "recommend_pause",
      "campaign_id": "camp_freezzo_single_nov2025_youtube",
      "creative_id": "creative_freezzo_short_hookC_03",
      "reason": "cpv_usd > 0.04 OR avg_watch_percent < 20"
    }
  ],

  "status": "completed",
  "errors": []
}
```

### Indexes

```js
db.ad_bot_runs.createIndex({ bot_id: 1, started_at: -1 });
db.ad_bot_runs.createIndex({ artist_ids: 1, started_at: -1 });
db.ad_bot_runs.createIndex({ playbook_id: 1, started_at: -1 });
```

---

## 7. Collection: `ad_policy_flags`

Keeps you safe: if any creative/campaign looks risky, bots log it here.

### Example

```json
{
  "_id": "flag_creative_freezzo_short_hookB_01_2025-11-18",
  "artist_id": "artist_freezzo_id",
  "campaign_id": "camp_freezzo_single_nov2025_youtube",
  "creative_id": "creative_freezzo_short_hookB_01",
  "platform": "youtube",

  "flag_type": "policy_risk",
  "severity": "medium",
  "rules_triggered": ["no_explicit_content_in_title"],
  "message": "Detected explicit word in headline - risk of ad disapproval.",

  "detected_at": "2025-11-18T23:00:00Z",
  "resolved_at": null,
  "resolved_by_user_id": null,
  "resolution_note": null
}
```

### Indexes

```js
db.ad_policy_flags.createIndex({ creative_id: 1, detected_at: -1 });
db.ad_policy_flags.createIndex({ artist_id: 1, detected_at: -1, severity: 1 });
```

---

## 8. How 10,000 bots plug into this

* **`ad_bots`** – defines who the bot is and what it's assigned to.
* **`ad_playbooks`** – tells it *how* to think and act.
* **`ad_campaigns` / `ad_creatives`** – what it's allowed to touch.
* **`ad_metrics_daily`** – what happened from yesterday's work.
* **`ad_bot_runs`** – what the bot decided to do about it.
* **`ad_policy_flags`** – block anything risky before it goes live.

This is the foundation for a world where:

> "Every serious campaign decision is backed by data from thousands of bot runs, but you're still in full control."
