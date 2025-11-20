# BOTS_MARCHING_ORDERS.md

DMF Ad Bot Army – Roles & Daily Duties (Locked)

## Mission

> Make DMF artists millions of dollars legally by mastering ads and campaigns across YouTube, Meta, TikTok, Google, and more — without risking bans or fake streams.

Every bot:

1. Reads from: `ad_playbooks`, `ad_campaigns`, `ad_creatives`, `ad_metrics_daily`.
2. Writes to: `ad_bot_runs` (what they did), sometimes `ad_policy_flags`.
3. Keeps focus on artists in `assigned_artist_ids`.

---

## Divisions & Roles

### 1. Audience Intel Division

**Collections touched:**  
- Read: `artists`, `releases`, external platform data  
- Write: audience segments into `ad_campaigns` fields (`target_countries`, `age_range`, etc.)

**Role examples:**

- `audience_profiler`
- `geo_cluster_finder`
- `lookalike_strategist`

**Daily duties:**

- Map who the real fan is for each artist:
  - Age, city, devices, top interest clusters.
- Propose:
  - New target cities and age bands.
  - Which audiences should be "cold," "warm," or "hot."
- Update `ad_campaigns` with improved targeting fields.

**Key KPIs:**

- Higher CTR
- Cheaper CPV
- Better watch time from target audiences

---

### 2. Creative Lab Division

**Collections touched:**  
- Read: `releases`, `ad_metrics_daily`  
- Write: `ad_creatives`

**Role examples:**

- `hook_tester`
- `thumbnail_optimizer`
- `copywriter_music_ads`

**Daily duties:**

- Generate variant ideas for:
  - Hooks, thumbnails, headlines, CTAs.
- Use past metrics to find:
  - Which style got the best watch%, CTR, and subs.
- Create/modify `ad_creatives` with:
  - Asset URLs, headlines, body text, status.

**Key KPIs:**

- Higher watch percent
- Higher CTR
- More subs/follows per impression

---

### 3. Platform Commanders

**Collections touched:**  
- Read: `ad_campaigns`, `ad_creatives`, `ad_metrics_daily`  
- Write: `ad_bot_runs` (recommended changes), sync with platform APIs

**Role examples:**

- `youtube_shorts_scaler`
- `youtube_instream_manager`
- `meta_reels_commander`
- `tiktok_feed_commander`

**Daily duties:**

- For each campaign:
  - Scan daily metrics.
  - Identify top creatives vs weak ones.
- Produce actions:
  - Recommend scaling budgets on winners.
  - Recommend pausing or replacing losers.
- Log in `ad_bot_runs.actions`:
  - `recommend_scale`
  - `recommend_pause`
  - `recommend_duplicate_to_new_audience`

**Key KPIs:**

- Lower CPV/CPC
- More completed views
- More subs/follows tied to campaigns

---

### 4. Funnel & Offer Division

**Collections touched:**  
- Read: `ad_campaigns`, `ad_metrics_daily`, landing/funnel data  
- Write: updates to `ad_campaigns` and funnel configs (external collections)

**Role examples:**

- `smartlink_optimizer`
- `landing_page_refiner`
- `offer_matcher`

**Daily duties:**

- Check which campaigns actually produce:
  - Email/SMS signups
  - Smart link clicks
  - Merch/offer conversions
- Suggest:
  - Better CTAs ("Listen now", "Watch full story", "Join text list").
  - Which offers go with which campaign stage (cold vs warm).
- Work with StreamGod to tie campaigns to real money paths.

**Key KPIs:**

- Higher conversion rate off-clicks
- Higher revenue per $ spent

---

### 5. Budget & Bidding Optimizers

**Collections touched:**  
- Read: `ad_metrics_daily`  
- Write: `ad_bot_runs` (budget recommendations)

**Role examples:**

- `budget_guardian`
- `daily_spend_balancer`
- `scale_planner`

**Daily duties:**

- For each campaign:
  - Compare spend vs results per day.
- Apply rules from `ad_playbooks.kpis`:
  - If CPV < target and watch% > target → recommend +20–30% budget.
  - If CPV > target or watch% trash → recommend budget cut or pause.
- Flag any campaign overspending against `budget_daily_cap_usd`.

**Key KPIs:**

- Max results per dollar
- No surprise budget blowouts

---

### 6. Analytics & Attribution Squad

**Collections touched:**  
- Read: `ad_metrics_daily`, external stream data  
- Write: reporting aggregates, feeds StreamGod / dashboards

**Role examples:**

- `kpi_reporter`
- `platform_comparison_analyst`
- `artist_scorecard_builder`

**Daily duties:**

- Build **artist scorecards**:
  - Which platform prints the best fans and streams.
- Compare:
  - Ads cost vs estimated streams & revenue.
- Supply inputs for marketing dashboards and StreamGod's strategy engine.

**Key KPIs:**

- Clarity: owner can see "where the money actually came from"
- Faster decision-making on what to scale

---

### 7. Reputation & Community Squad

**Collections touched:**  
- Read: social engagement data (comments, DMs, etc.)  
- Write: suggestion logs (stored in a future `community_recommendations` collection or similar)

**Role examples:**

- `comment_mirror`
- `content_prompt_bot`
- `organic_sync_bot`

**Daily duties:**

- Scan comments and fan reactions.
- Suggest:
  - TikTok responses.
  - IG Reels topics.
  - YouTube community posts.
- Keep **paid + organic** in sync:
  - If a clip hits organic, signal Platform Commanders to push that creative in paid.

**Key KPIs:**

- Stronger engagement rate
- More organic lift from paid campaigns

---

### 8. Compliance & Brand Safety

**Collections touched:**  
- Read: `ad_creatives`, `ad_campaigns`  
- Write: `ad_policy_flags`

**Role examples:**

- `policy_checker`
- `creative_filter`
- `brand_guardian`

**Daily duties:**

- Scan every active creative:
  - Titles, captions, thumbnails, visuals.
- Check against:
  - `ad_playbooks.compliance_rules`
  - Platform policy rules.
- If risk detected:
  - Create `ad_policy_flags` doc.
  - Set `status` on creative to `paused` if necessary (once integrated).

**Key KPIs:**

- Zero policy bans
- Minimal disapprovals
- Clean ad accounts

---

## Daily Bot Routine (All Divisions)

Every bot follows this flow:

1. **Fetch assignment**
   - Read its record from `ad_bots`.
   - Load relevant `ad_playbooks`.

2. **Pull data**
   - Read from `ad_campaigns`, `ad_creatives`, `ad_metrics_daily` filtered by `assigned_artist_ids`.

3. **Think & decide**
   - Apply rules from `ad_playbooks` to metrics and campaign state.
   - Generate actions (scale, pause, create, flag, recommend).

4. **Write log**
   - Save run in `ad_bot_runs` with:
     - Actions taken / recommended
     - Reason fields (thresholds, metrics)
     - Any errors

5. **Update schedule**
   - Update `ad_bots.last_run_at` and `next_run_after`.

StreamGod reads these logs and decides what gets auto-applied vs what waits for owner approval.

---

## Owner Controls

- You control:
  - Which bots are `status: active`.
  - Which `ad_playbooks` are `is_active: true`.
  - Budgets (`budget_total_usd`, `budget_daily_cap_usd`).
- The system:
  - Suggests the smart moves.
  - Logs everything for later review.
  - Keeps DMF fully legal and defensible.

This document and `AD_BOTS_SCHEMA.md` are now the **locked base** for your ad bot infrastructure.
