/**
 * Campaign Service
 * Generates real ad campaigns using Ryia Boss + StreamGod Brain
 * Monetizable: Starter ($25) ? Empire ($999)
 */

const { streamgodRouter } = require("../streamgod/brain");

/**
 * Generate a complete campaign pack for a track
 * Ryia designs real ads for YouTube, Instagram, TikTok, Spotify, Google Display
 */
async function generateCampaignAssets(input) {
  const {
    artist_name,
    track_title,
    track_link,
    platforms,
    budget_usd,
    goal = "streams",
    geo = "US",
    tier = "starter"
  } = input;

  // Build the prompt for Ryia
  const platformsText = platforms.join(", ");
  const budgetPerPlatform = platforms.length > 0 ? Math.floor(budget_usd / platforms.length) : budget_usd;

  const systemPrompt = `
You are Ryia Boss, DMF's campaign architect AI.

Your job: Design a REAL, high-converting ad campaign to drive human streams to this music track.
NO fake traffic. NO bots. Only authentic engagement.

ARTIST: ${artist_name}
TRACK: ${track_title}
TRACK URL: ${track_link || "Not provided"}

CAMPAIGN GOAL: ${goal}
BUDGET: $${budget_usd} total
BUDGET PER PLATFORM: ~$${budgetPerPlatform}
TARGET GEO: ${geo}
TIER: ${tier}
PLATFORMS: ${platformsText}

---

FOR EACH PLATFORM, DESIGN:

1. **Primary Hook** (eye-catching first 3 seconds)
2. **Ad Copy** (clear, conversational, emotion-driven)
3. **Video Script** (if video: exact words, pacing, music cues)
4. **Duration** (optimal for each platform)
5. **Call-to-Action** (listen on Spotify, watch on YouTube, etc.)
6. **Audience Targeting** (age, interests, behaviors, lookalikes)
7. **Placement Notes** (best placements, time of day, formats)

---

PLATFORM-SPECIFIC BEST PRACTICES:

**YouTube Ads:**
- Hook viewer in first 2 seconds (music, emotion, conflict)
- 15-30 seconds ideal
- Include short clips of music/vibe
- CTA: "Listen on Spotify/Apple Music/YouTube Music"
- Audience: Music fans aged 13-45, similar to related artists

**Instagram Reels:**
- Trending audio + your track = powerful
- 15-30 seconds, fast cuts, transitions
- On-screen text (artist name, track name)
- Hashtags: mix of popular (#newmusic 50M+) + niche (#hiphopu 2M+)
- Audience: Music discovery, creator-focused (18-35)

**TikTok Ads:**
- Lean into trends, challenges, sounds
- 9-15 seconds (shorter = better CPC)
- Authentic, unpolished vibe beats over-produced
- Trending sounds boost organic reach
- Audience: Gen Z, TikTok-native users (13-34)

**Spotify Audio Ads:**
- Host-read or AI voice ("Hey Spotify listeners...")
- 15-30 seconds, conversational tone
- Emotional connection > hard sell
- CTA: "Add to your playlist" or "Listen now"
- Audience: Music streamers matching artist genre/mood

**Google Display:**
- Static images or short looping video (1920x1080, 300x250)
- Thumbnail prompt for visual design (Ryia suggests this)
- Retargeting + lookalike audiences
- Geo-targeting by region (US by default)
- CTA: "Discover [Artist] on Spotify"

---

ANTI-BOT COMPLIANCE:

? Only target real humans (real device IDs, real engagement)
? Avoid click farms, view farms, stream farms
? Set daily spending caps to prevent fraud
? Use platform's fraud detection (YouTube, Instagram, TikTok all have it)
? Real streams should come from real listeners

---

TIER-SPECIFIC EXPECTATIONS:

**Starter ($25):** 1 platform, basic ad copy, general targeting
**Pro ($99):** 3 platforms, 3-5 variations each, refined targeting
**Elite ($299):** All 5 platforms, 5-10 variations, detailed audience breakdown
**Empire ($999):** All platforms, premium variations, playlist pitching strategy, quarterly analytics review

---

NOW, DESIGN THE CAMPAIGN:

Return your response in this format:

## Campaign Pack: [Artist] – [Track]

### YouTube Ads (Budget: ~$${budgetPerPlatform})
[Design YouTube ads]

### Instagram Reels (Budget: ~$${budgetPerPlatform})
[Design Instagram ads]

[Continue for other platforms if included]

### Thumbnail Prompts
[3-5 visual design ideas for cover art]

### Hashtag Strategy
[2-3 hashtag bundles optimized for reach + niche]

### Funnel Notes
[Short explanation of how the campaign funnels real people to the track]

### Budget Breakdown
[Total spend, per-platform allocation, expected metrics]

---

RESPOND WITH THE FULL CAMPAIGN DESIGN. This will be sent to the artist + used in ads.
`;

  console.log(`[Campaign Service] Generating ${tier} pack for ${artist_name} - ${track_title}`);
  console.log(`[Campaign Service] Platforms: ${platformsText}, Budget: $${budget_usd}`);

  try {
    // Use Ryia Boss (Ryia's designated campaign task)
    const job = streamgodRouter("CAMPAIGN_BUILD_STREAMS", {
      artist_name,
      track_title,
      track_link,
      platforms,
      budget_usd,
      goal,
      geo,
      tier
    });

    console.log(`[Campaign Service] Using model: ${job.model}`);

    // STUB: In production, call real OpenAI
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const response = await openai.chat.completions.create({
    //   model: job.model,
    //   messages: [{ role: "system", content: systemPrompt }],
    //   temperature: 0.7,
    //   max_tokens: 3000
    // });

    // For now, return a realistic campaign stub
    const campaignText = generateCampaignStub(
      artist_name,
      track_title,
      platforms,
      budgetPerPlatform,
      tier
    );

    return {
      text: campaignText,
      model: job.model,
      systemPrompt, // for debugging
      platforms,
      budget_usd,
      tier
    };
  } catch (err) {
    console.error("[Campaign Service] Error generating campaign:", err);
    throw err;
  }
}

/**
 * Generate campaign stub for testing
 * In production, this is replaced with real OpenAI output
 */
function generateCampaignStub(artist_name, track_title, platforms, budgetPerPlatform, tier) {
  let campaign = `## Campaign Pack: ${artist_name} – ${track_title}

?? **Tier:** ${tier.toUpperCase()} | ?? **Platforms:** ${platforms.join(", ")}

---

`;

  if (platforms.includes("youtube")) {
    campaign += `### YouTube Ads (Budget: ~$${budgetPerPlatform})

**Primary Hook:**
"[Opening scene: silhouette with music swelling] 
[Text overlay: "NEW MUSIC"]
[Quick cut to artist performing/vibe]"

**Ad Copy:**
"Discover [${artist_name}]'s latest track — [${track_title}].
Drop everything. Listen now."

**Video Script:**
[0-2s] Hook: music builds, artist name appears
[2-8s] Track preview (most catchy 6 seconds)
[8-12s] Call to action: "Listen on Spotify/Apple Music/YouTube Music"

**Duration:** 15 seconds (TrueView)

**Call-to-Action:**
"Listen on [DSP]" ? redirects to track link

**Audience Targeting:**
- Age: 18-45
- Interests: Music, [genre], similar artists
- Device: Desktop, Mobile (prioritize mobile 60%)
- Lookalike: Fans of [similar artists]

**Placement Notes:**
- YouTube In-Stream (before music videos, artist channels)
- YouTube Shorts (growing placements)
- Desktop + Mobile (60/40 split)
- Time of day: 3pm-11pm (peak music listening)

---

`;
  }

  if (platforms.includes("instagram")) {
    campaign += `### Instagram Reels (Budget: ~$${budgetPerPlatform})

**Primary Hook:**
"[Trending audio + your track mashup]
[Quick visual transitions]
[Artist name + track title overlaid]"

**Ad Copy:**
"?? NEW MUSIC ??
[${artist_name}] – [${track_title}]
Link in bio ? [Spotify link]"

**Video Script (15-30 seconds):**
[0-2s] Trending sound intro
[2-8s] Most engaging clip + text overlay
[8-15s] Call to action: "Tap to listen"

**Hashtag Sets:**
1. #NewMusic #IndieMusic #SpotifyPlaylist #Artist (broad reach)
2. #[Genre]Music #HipHop #Trap #RnB (niche targeted)
3. #MusicPromotion #NewArtist #IndieArtist (discovery)

**Audience Targeting:**
- Age: 18-40
- Interests: Music discovery, artists, [genre]
- Location: ${platforms[0] === "instagram" ? "US, UK, CA, AU" : "US"}
- Device: Mobile (100%)

**Placement Notes:**
- Reels feed (primary)
- Explore page (secondary)
- Hashtag pages (best for organic boost)
- Partner reels (collaborations increase reach 3x)

---

`;
  }

  if (platforms.includes("tiktok")) {
    campaign += `### TikTok Ads (Budget: ~$${budgetPerPlatform})

**Primary Hook:**
"[Trending sound #1 for your region]
[Quick visual: artist or vibe]
[Text: New music alert]"

**Ad Copy:**
"NEW: [${artist_name}] – [${track_title}] ??
Who's adding this to their playlist?"

**Video Script (9-15 seconds):**
[0-1s] Trending sound + visuals
[1-8s] Track preview + energy
[8-15s] CTA: "Add to playlist" / "Listen now"

**Trending Sounds for This Campaign:**
[Research top 10 sounds for [genre] in ${platforms[0] === "tiktok" ? "US" : "target region"}]
Examples: [TikTok trends API response would go here]

**Challenge Idea:**
"Lip-sync to [track], tag [artist]"
or
"Dance challenge: [track] edition"

**Hashtags:**
#NewMusic #[Artist] #[TrackName] #MusicPromo #TikTokMusic #ViralMusic

**Audience Targeting:**
- Age: 13-40 (TikTok skews young)
- Interests: Music, creators, [genre]
- Location: US (primary), UK, CA (secondary)
- Device: Mobile (100%)

**Placement Notes:**
- For You Page (main revenue driver)
- Hashtag pages + trending tab
- Creator marketplace for collab boosts
- Cost: Often 10-50% cheaper than YouTube/Instagram

---

`;
  }

  if (platforms.includes("spotify")) {
    campaign += `### Spotify Audio Ads (Budget: ~$${budgetPerPlatform})

**Ad Copy Script (15-30 seconds):**
"Listeners, discover a fresh sound.
[${artist_name}] just dropped [${track_title}].
Stream now on Spotify — tap to listen.
[Track preview, 5 seconds]
That's [${artist_name}] – [${track_title}].
Add to your playlist today."

**Host Read Alternative:**
"Yo, we found this track [${artist_name}] – [${track_title}].
If you like [similar artist], you'll love this.
Listen now on Spotify."

**Call-to-Action:**
Clear, non-pushy CTA after preview:
"Add to your playlist" (not "Buy now")

**Audience Targeting:**
- Listeners of [genre]
- Listeners of similar artists
- New music discovery listeners (top 20% most open to new tracks)
- Playlist followers in related categories

**Placement Notes:**
- Audio ads between songs (premium placements)
- Podcast ad pods (music podcast audiences = high intent)
- Playlist recommendations
- Best time: Evening commute (5-8pm)

---

`;
  }

  if (platforms.includes("google_display")) {
    campaign += `### Google Display Network (Budget: ~$${budgetPerPlatform})

**Display Banner Ad Copy:**
"Discover [${artist_name}]
New Track: [${track_title}]
Listen Now on Spotify"

**Thumbnail Visual Prompt:**
"High-contrast album art with artist name
Bold, music-focused imagery
Include track title overlay
Colors: [Primary color] + White text
Size: 1920x1080 (landscape), 300x250 (square), 160x600 (vertical)"

**Targeting Keywords:**
- Music streaming
- Independent music
- [Genre] music
- [Similar artists]
- Music discovery
- Spotify

**Audience Segments:**
- In-market music listeners
- Affinity: Music enthusiasts
- Lookalike: Spotify users similar to listeners of [artist]

**Placement Notes:**
- Music websites, blogs, forums
- YouTube partner network (non-video)
- Social media sidebars
- Search partners
- Geo-targeting: US (primary)

---

`;
  }

  campaign += `### Thumbnail Design Prompts

1. "Album art style: high-contrast, artist name + track title overlaid, modern music aesthetic, vibrant colors"
2. "Minimalist: single word + track name on solid color background, typography-focused"
3. "Emotional: artist in silhouette with music visualization, moody lighting, track title in top right"

---

### Hashtag Strategy

**Broad Reach Bundle:**
#NewMusic #SpotifyPlaylist #IndependentArtist #MusicPromotion #DiscoverMusic

**Niche + Genre Bundle:**
#[Genre]Music #HipHop #IndieArtist #UndergroundMusic #NewArtist

**Engagement + Community Bundle:**
#SupportIndieArtists #MusicLover #PlaylistCurator #MusicCommunity #ArtistLife

---

### Funnel Notes

**Campaign Flow:**

Awareness ? Interest ? Consideration ? Conversion

1. **Awareness Phase** (YouTube, Instagram, TikTok)
   - Ad shown to cold audiences (interests + lookalikes)
   - Goal: 5-10% click-through rate
   - Funnel: 1000 impressions ? 50-100 clicks

2. **Interest Phase** (Link to Landing)
   - User lands on Spotify/track link
   - Preview 30 seconds
   - Decision point: Add to playlist or move on

3. **Consideration Phase** (Social Proof)
   - Display similar playlists
   - Show artist social (followers, similar artists)
   - Lower friction: 1-click playlist add

4. **Conversion** (Stream + Follow)
   - User streams track 30+ seconds = conversion
   - Track added to playlist = secondary metric
   - Follow artist = long-term engagement

**Anti-Bot Safeguards:**
? Real device IDs only (no click farms)
? Daily spend caps ($5-10/day starting)
? Monitor CTR (healthy: 2-5%)
? Flag: >50% bounce rate = potential fraud
? Spotify/YouTube anti-fraud already baked in

---

### Budget Breakdown

**Total Campaign Budget:** $${platforms.reduce((a, b) => a + budgetPerPlatform, 0)}

Per Platform:
${platforms.map((p) => `- ${p.toUpperCase()}: ~$${budgetPerPlatform}`).join("\n")}

**Expected Performance (Conservative Estimates):**
- Total Impressions: ~50,000 - 100,000
- Estimated Clicks: 1,000 - 3,000 (2-3% CTR)
- Streams Generated: 500 - 2,000 (depending on playlist adds)
- Cost Per Stream: $${(platforms.reduce((a, b) => a + budgetPerPlatform, 0) / 1000).toFixed(2)} (conservative)

---

**Next Steps:**
1. Review campaign pack with artist
2. Create actual ad creatives (videos, images)
3. Set up accounts in each platform
4. Launch with daily spend caps
5. Monitor for 1 week, optimize underperformers
6. Scale winning placements 2-3x

---

**Generated by Ryia Boss on ${new Date().toISOString().split("T")[0]}**
`;

  return campaign;
}

/**
 * Get campaign pricing/tier info
 */
function getTierInfo(tier) {
  const tiers = {
    starter: { price: 25, platforms: 1, variations: 1 },
    pro: { price: 99, platforms: 3, variations: 5 },
    elite: { price: 299, platforms: 5, variations: 10 },
    empire: { price: 999, platforms: 5, variations: 50, includes: ["media", "calls"] }
  };

  return tiers[tier] || tiers.starter;
}

module.exports = {
  generateCampaignAssets,
  getTierInfo
};
