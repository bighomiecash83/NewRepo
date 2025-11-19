# RYIA BOSS — COMMAND PACK

**Preset commands and workflows for the OpenAI Assistant (StreamGod / Ryia Boss).**

Use these as templates when talking to your Ryia Boss AI operator.

---

## 🎯 Quick Commands (Copy-Paste Ready)

### CATALOG COMMANDS

#### 1. "What's in my catalog?"
```
List all my releases and show:
- Total number of releases
- Release types (single, EP, album, mixtape)
- Total tracks
- Any recent additions
```

**What Ryia does:**
- Calls `list_releases()`
- Counts and categorizes
- Reports summary

---

#### 2. "Score my entire catalog"
```
Score every track in my catalog for release readiness.
Show:
- Overall catalog health score (0-100)
- Breakdown by readiness level (high/medium/low)
- Top 10 tracks by score
- Bottom 5 tracks that need work
```

**What Ryia does:**
- Calls `list_tracks()`
- Calls `score_track()` for each track
- Aggregates and ranks
- Identifies improvement areas

---

#### 3. "What are my priority tracks for the next 30 days?"
```
Analyze my catalog for immediate release potential.
Show:
- Top 5 tracks ready for immediate release
- Estimated release dates based on readiness
- Marketing timeline for each
- Expected stream projections
```

**What Ryia does:**
- Calls `list_releases()` + `list_tracks()`
- Calls `get_recommendations()`
- Calculates timelines
- Provides strategic calendar

---

### BRAIN COMMANDS

#### 4. "Analyze my catalog health"
```
Run a comprehensive analysis on my catalog. Report:
- Overall catalog readiness
- Technical quality score
- Commercial potential ranking
- Genre distribution
- Recommendations for improvement
```

**What Ryia does:**
- Calls `analyze_catalog(analysis_type="readiness")`
- Calls `generate_insights(focus_area="release_strategy")`
- Synthesizes findings
- Suggests next actions

---

#### 5. "Score this track and tell me if it's release-ready"
[Provide track details or ID]

```
Score my track [TITLE] by [ARTIST] and determine:
- Readiness score (0-100)
- Is it release-ready now? (Yes/No/Nearly)
- What needs improvement
- Recommended release window
- Expected potential streams
```

**What Ryia does:**
- Calls `score_track()`
- Analyzes readiness
- Suggests improvements
- Provides timeline

---

#### 6. "What's my top recommendation for next release?"
```
Look at my whole catalog and tell me:
- Which track should I release next
- Why it's the best choice
- When to release it
- How to market it
- Expected revenue
```

**What Ryia does:**
- Calls `list_releases()` + `list_tracks()`
- Calls `get_recommendations()`
- Evaluates each track
- Ranks and explains top choice

---

### DISTRIBUTOR / PRICING COMMANDS

#### 7. "How much does it cost to release a single?"
```
Get the pricing for releasing a single track via DMF.
Show:
- Base cost
- What's included
- Any discounts available
- Timeline from release to distribution
```

**What Ryia does:**
- Calls `get_release_quote(release_type="single", track_count=1)`
- Returns pricing and features
- Explains value

---

#### 8. "Compare all release types and pricing"
```
Show me the cost and details for all release types:
- Single (1 track)
- EP (2-4 tracks)
- Album (5+ tracks)
- Mixtape (8+ mixed tracks)

Include: cost, features, benefits, when to use each
```

**What Ryia does:**
- Calls `get_release_quote()` for each type
- Creates comparison table
- Recommends based on situation

---

#### 9. "What would I make from 100k streams on different tiers?"
```
Calculate my potential earnings across all payout tiers for a single release.
Assume 100,000 streams and show:
- Indie Basic (90/10) → artist payout
- Indie Plus (85/15) → artist payout
- Growth Partner (70/30) → artist payout
- Label White Label (50/50) → artist payout

Also show: per-stream rate, total DMF revenue, recommendation for my stage
```

**What Ryia does:**
- Calls `get_payout_quote()` for each tier
- Calculates payouts at 100k streams
- Creates comparison
- Recommends tier

---

#### 10. "Estimate my total revenue if I release all my tracks"
```
Calculate total potential revenue if I:
1. Release all tracks as optimized single/EP/album
2. Assume average 50k streams per release
3. Use the Indie Plus tier

Show:
- Total releases
- Total estimated streams
- Total estimated payout to me
- Per-track average
- DMF's revenue (for transparency)
```

**What Ryia does:**
- Gets all tracks via `list_releases()`
- Calls `get_payout_quote()` for projections
- Aggregates total revenue
- Shows financial runway

---

## 📅 STRATEGIC COMMANDS

### 11. "Create a 30-day release strategy"
```
Build a complete 30-day release plan including:
- What to release (which track/EP)
- When to release it (specific date)
- Pre-release marketing (week 1)
- Release day strategy (week 2)
- Post-launch momentum (weeks 3-4)
- Playlist pitching timeline
- Social media calendar
- Expected outcomes

Base it on my actual catalog and readiness scores.
```

**What Ryia does:**
- Calls `list_releases()` + `list_tracks()`
- Calls `score_track()` for priorities
- Calls `get_recommendations()`
- Calls `get_payout_quote()` for projections
- Creates comprehensive strategy calendar

---

### 12. "Build my 90-day growth plan"
```
Create a 90-day strategic release plan that:
1. Maximizes my growth potential
2. Builds momentum across releases
3. Targets playlist placements
4. Manages release spacing
5. Includes revenue projections

Show:
- Release schedule (with dates)
- Marketing roadmap
- Expected growth metrics
- Total projected revenue
- Key milestones to hit
```

**What Ryia does:**
- Deep catalog analysis
- Strategic recommendations
- Multi-release planning
- Financial projections
- Milestone tracking

---

### 13. "Audit my catalog for quality and commercial potential"
```
Run a full audit:
- Technical quality (production, mastering)
- Commercial potential (genre, trends)
- Metadata completeness (tags, descriptions)
- Release gaps (when was last release?)
- Competitive positioning

Flag any issues and recommend fixes.
```

**What Ryia does:**
- Calls `analyze_catalog()`
- Calls `generate_insights()`
- Identifies issues
- Suggests improvements
- Prioritizes action items

---

## 💰 FINANCIAL COMMANDS

### 14. "What tier should I use?"
```
Based on my catalog and goals, which payout tier should I select?

Consider:
- My stage (indie/growth/label)
- Revenue needs
- Growth trajectory
- Long-term strategy

Recommend: [tier] because [reasons]
```

**What Ryia does:**
- Analyzes situation
- Calls `get_payout_quote()` for each tier
- Compares trade-offs
- Recommends optimal choice

---

### 15. "Show me the math on tier upgrades"
```
If I upgrade from Indie Basic to Indie Plus:
- Current earnings at 100k streams
- Earnings after upgrade
- Additional revenue per 10k streams
- Break-even point
- When should I upgrade?
```

**What Ryia does:**
- Calls `get_payout_quote()` for both tiers
- Shows side-by-side comparison
- Calculates upgrade benefit
- Suggests timing

---

## 🎯 OPERATIONAL COMMANDS

### 16. "Create a release draft"
```
Create a draft release for:
- Title: [RELEASE_TITLE]
- Type: [single/ep/album/mixtape]
- Tracks: [LIST_TRACKS]
- Payout Tier: [indie_basic/indie_plus/growth_partner/label_white_label]
- Release Date: [DATE]

Show me a preview before publishing.
```

**What Ryia does:**
- Calls `create_release()`
- Returns draft preview
- Ready for final approval

---

### 17. "What's my next recommended action?"
```
Look at my catalog, releases, and scores.
Tell me:
- What single action would have the biggest impact
- Why it's important
- How to execute
- Expected outcome
- Timeline
```

**What Ryia does:**
- Calls all analysis functions
- Determines highest-impact action
- Provides clear guidance

---

## 🚀 POWER COMMANDS (Multi-Function)

### 18. "Give me the executive summary"
```
In under 100 words, tell me:
- Overall catalog health
- Top priority action
- Current biggest opportunity
- Key number (revenue opportunity)
- Recommended next step
```

**What Ryia does:**
- Fast analysis
- Clear, actionable summary
- Perfect for daily standup

---

### 19. "I'm launching tomorrow. What do I do?"
```
My [TRACK] is releasing tomorrow.
Give me:
- 24-hour pre-launch checklist
- Hour-by-hour countdown
- Social media posts (ready to send)
- Email copy (for list)
- What to monitor live
- Success metrics to track
```

**What Ryia does:**
- Operational checklist
- Marketing content
- Monitoring guidance
- Success criteria

---

### 20. "What's my best path to 1 million streams?"
```
Based on my current catalog and tier, what's the realistic path to 1M streams?

Show:
- Current trajectory
- Bottlenecks
- Key improvements needed
- Timeline (conservative / aggressive)
- Tier upgrade recommendation
- Capital/investment needed
- Next 3 milestones (100k, 500k, 1M)
```

**What Ryia does:**
- Deep strategic analysis
- Realistic forecasting
- Clear milestones
- Investment recommendations

---

## 💡 WORKFLOW PATTERNS

### The Daily Standup (2 minutes)
```
Ryia, executive summary and one action I should take today.
```

### The Weekly Review (10 minutes)
```
Score my catalog again, show what changed, recommend priority for this week.
```

### The Monthly Strategy (30 minutes)
```
Full audit, 30-day plan, financial projection, tier analysis.
```

### The Quarterly Deep Dive (1 hour)
```
Comprehensive 90-day strategy, growth plan, tier recommendations, investment needs.
```

### Pre-Launch (1 hour)
```
Complete launch plan for [track], including timeline, marketing, monitoring, metrics.
```

---

## 🎨 CUSTOMIZATION

You can modify these commands with your specifics:

- Replace `[TRACK]` with actual track titles
- Replace `[DATE]` with specific dates
- Replace `[GOAL]` with your targets (streams, revenue, etc.)
- Combine commands (e.g., "Score catalog, then create 30-day plan")

---

## 📊 METRIC INTERPRETATIONS

When Ryia gives you numbers, here's what they mean:

| Metric | Interpretation |
|--------|-----------------|
| Readiness Score 0-50 | Not ready, needs improvement |
| Readiness Score 51-75 | Good, ready for niche audiences |
| Readiness Score 76-100 | Excellent, mainstream potential |
| Per-stream rate $0.003-0.005 | Industry standard |
| Payout tier 90% | Keep most revenue (indie growth) |
| Payout tier 50% | Split revenue (white label/label deal) |

---

## 🔄 FEEDBACK LOOP

After Ryia gives you a plan:

1. **Implement** the top 3 recommendations
2. **Wait** 2-4 weeks for metrics to settle
3. **Ask Ryia**: "Re-score my catalog, what improved?"
4. **Repeat** until you hit your goal

Example:
```
Ryia, last time you recommended [X].
I did it. Score my catalog again and tell me what improved.
```

---

## 🎯 SUCCESS INDICATORS

You're using Ryia Boss effectively when:

- ✅ You know exactly what to release next
- ✅ You understand your revenue at each tier
- ✅ You have a 30-90 day plan
- ✅ You're hitting your targets
- ✅ Decisions are data-backed

You've mastered it when:

- ✅ Ryia predicts your metrics within 10%
- ✅ You're scaling to next tier
- ✅ You're planning 6-12 months ahead
- ✅ Revenue is growing consistently

---

**Ryia Boss = Your AI Strategic Operator**

Use these commands to unlock DMF's full potential. 🚀
