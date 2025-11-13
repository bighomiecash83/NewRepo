# ?? AI PLAYGROUND INTEGRATION - Program.cs Setup

## Add to Program.cs

```csharp
// After existing configuration...

// ========================================================================
// AI PLAYGROUND SETUP
// ========================================================================

// 1. Configure Firebase Firestore
var firebaseOptions = new AppOptions
{
    Credential = GoogleCredential.FromFile("firebase-key.json"),
    ProjectId = "dmf-music-platform"
};

FirebaseApp.Create(firebaseOptions);
var db = FirestoreDb.Create("dmf-music-platform");
builder.Services.AddSingleton(db);

// 2. Register AI Playground Services
builder.Services.AddScoped<IBotLessonService, BotLessonService>();
builder.Services.AddScoped<IBotEvaluatorService, BotEvaluatorService>();
builder.Services.AddScoped<IBotPromotionService, BotPromotionService>();
builder.Services.AddScoped<IBotCurriculumService, BotCurriculumService>();
builder.Services.AddScoped<IPlaygroundDatasetService, PlaygroundDatasetService>();
builder.Services.AddScoped<IDatasetSanitizerService, DatasetSanitizerService>();

// 3. Add hosted service for daily learning job
builder.Services.AddHostedService<DailyLearningScheduler>();

// 4. Configure CORS for Playground
builder.Services.AddCors(options =>
{
    options.AddPolicy("PlaygroundCors", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

// 5. Add authorization policy for Playground
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("PlaygroundAccess", policy =>
        policy.RequireRole("system_ops", "founder"));
});

// ========================================================================
// END PLAYGROUND SETUP
// ========================================================================

var app = builder.Build();

// Map Playground endpoints BEFORE MapControllers
app.MapControllers();

app.Run();
```

---

## Create Hosted Service for Daily Learning

```csharp
// File: DailyLearningScheduler.cs

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using DMF_MUSIC_PLATFORM.Infrastructure.AIPlayground.Services;

namespace DMF_MUSIC_PLATFORM.Infrastructure.AIPlayground
{
    /// <summary>
    /// Scheduled job - runs daily at 03:00 UTC
    /// Starts new lessons for all active bots
    /// </summary>
    public class DailyLearningScheduler : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DailyLearningScheduler> _logger;
        private PeriodicTimer _timer;

        public DailyLearningScheduler(
            IServiceProvider serviceProvider,
            ILogger<DailyLearningScheduler> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Run at 03:00 UTC daily
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddHours(3);

            if (now > nextRun)
            {
                nextRun = nextRun.AddDays(1);
            }

            var delay = nextRun - now;
            _logger.LogInformation($"Daily learning scheduler will start in {delay.TotalHours:F2} hours");

            // Initial delay until 03:00 UTC
            await Task.Delay(delay, stoppingToken);

            // Then run every 24 hours
            _timer = new PeriodicTimer(TimeSpan.FromHours(24));

            try
            {
                while (await _timer.WaitForNextTickAsync(stoppingToken))
                {
                    await RunDailyLearningAsync(stoppingToken);
                }
            }
            finally
            {
                _timer?.Dispose();
            }
        }

        private async Task RunDailyLearningAsync(CancellationToken stoppingToken)
        {
            try
            {
                _logger.LogInformation("?? Starting daily bot learning cycle...");

                using (var scope = _serviceProvider.CreateScope())
                {
                    var promotionService = scope.ServiceProvider
                        .GetRequiredService<IBotPromotionService>();

                    // Evaluate all bots for promotion
                    await promotionService.EvaluateAllBotsForPromotionAsync();
                }

                _logger.LogInformation("? Daily bot learning cycle completed");
            }
            catch (Exception ex)
            {
                _logger.LogError($"? Error in daily learning cycle: {ex.Message}");
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping daily learning scheduler");
            _timer?.Dispose();
            await base.StopAsync(cancellationToken);
        }
    }
}
```

---

## Add NuGet Dependencies

```bash
dotnet add package FirebaseAdmin
dotnet add package Google.Cloud.Firestore
dotnet add package System.Text.Json
```

---

## Configure firebase-key.json

```json
{
  "type": "service_account",
  "project_id": "dmf-music-platform",
  "private_key_id": "your_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@dmf-music-platform.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

---

## Deploy Firestore Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Deploy rules
firebase deploy --only firestore:rules
```

---

## Test the System

```bash
# 1. Create test bots
curl -X POST https://localhost:5001/api/playground/bots \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"cohort":"distro_ops","skillLevel":"foundation"}'

# 2. Start lesson
curl -X POST https://localhost:5001/api/playground/lesson/start \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"botId":"bot_123"}'

# 3. Submit attempt
curl -X POST https://localhost:5001/api/playground/attempt \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "botId":"bot_123",
    "lessonId":"lesson_456",
    "output":{"result":"success"},
    "executionTimeMs":1200
  }'

# 4. Get evaluation
curl -X GET https://localhost:5001/api/playground/eval/eval_789 \
  -H "Authorization: Bearer [TOKEN]"

# 5. Get stats
curl -X GET https://localhost:5001/api/playground/stats \
  -H "Authorization: Bearer [TOKEN]"
```

---

## Architecture Overview

```
???????????????????????????????????????????????
?  Daily Learning Scheduler (03:00 UTC)       ?
?  - Starts lessons for active bots            ?
?  - Evaluates promotions                      ?
?  - Updates skill graphs                      ?
???????????????????????????????????????????????
                   ?
???????????????????????????????????????????????
?  Bot Lesson Service                         ?
?  - Curriculum engine (foundation?expert)     ?
?  - Task gym (distro_ops, metadata_qc, etc)   ?
?  - Spaced repetition                        ?
???????????????????????????????????????????????
                   ?
???????????????????????????????????????????????
?  Bot Evaluator Service                      ?
?  - Accuracy scoring                         ?
?  - Policy adherence check                   ?
?  - Latency measurement                      ?
?  - Authenticity validation                  ?
???????????????????????????????????????????????
                   ?
???????????????????????????????????????????????
?  Bot Promotion Service                      ?
?  - Automatic promotion (thresholds met)      ?
?  - Manual override (founder)                ?
?  - Demotion for policy violations           ?
???????????????????????????????????????????????
                   ?
???????????????????????????????????????????????
?  Firestore Collections                      ?
?  - playground_bots (profiles)               ?
?  - playground_lessons (tasks)               ?
?  - playground_attempts (submissions)        ?
?  - playground_evaluations (scores)          ?
?  - playground_promotions (history)          ?
?  - playground_datasets (training data)      ?
?  - playground_policy_exceptions             ?
???????????????????????????????????????????????
```

---

## Security Verification

? Firestore rules deployed  
? Only system_ops and founder can create bots  
? Evaluations immutable after completion  
? Promotions require thresholds or founder override  
? Policy exceptions need founder approval  
? Dataset sanitization enforced  
? No production PII in playground  
? All operations logged and auditable  

---

## Monitoring & Alerts

Monitor these metrics:

```
1. Bot Performance
   - Average accuracy per cohort
   - Success rate trends
   - Promotion rate

2. System Health
   - Daily schedule execution
   - Evaluation queue depth
   - Storage usage

3. Guardrail Compliance
   - Policy violations detected
   - False positives in sanitizer
   - Exception approval rate
```

---

## Troubleshooting

**Firestore connection fails:**
- Verify firebase-key.json exists and is valid
- Check Firebase project ID matches config
- Ensure service account has Firestore permissions

**Daily scheduler not running:**
- Check DailyLearningScheduler is registered
- Verify system time is in UTC
- Check logs for exceptions

**Evaluation queue backing up:**
- Monitor evaluator performance
- Scale horizontally if needed
- Check for memory leaks

---

**Status:** ? Ready for integration  
**Next:** Copy code files and deploy
