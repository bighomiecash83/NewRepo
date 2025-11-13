using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DMF_MUSIC_PLATFORM.Data.Distribution;
using DMF_MUSIC_PLATFORM.Infrastructure.Distribution;
using Google.Cloud.Firestore;

namespace DMF_MUSIC_PLATFORM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReleasesController : ControllerBase
    {
        private readonly FirestoreDb _firestore;
        private readonly IQcEngine _qcEngine;
        private readonly IDeliveryOrchestrator _deliveryOrchestrator;
        private readonly ILogger<ReleasesController> _logger;

        public ReleasesController(
            FirestoreDb firestore,
            IQcEngine qcEngine,
            IDeliveryOrchestrator deliveryOrchestrator,
            ILogger<ReleasesController> logger)
        {
            _firestore = firestore;
            _qcEngine = qcEngine;
            _deliveryOrchestrator = deliveryOrchestrator;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRelease([FromBody] CreateReleaseDto dto)
        {
            try
            {
                var userId = User.FindFirst("sub")?.Value ?? "unknown";

                var release = new Release
                {
                    Title = dto.Title,
                    Upc = dto.Upc,
                    ReleaseType = dto.ReleaseType ?? "Single",
                    ReleaseDate = dto.ReleaseDate,
                    CoverArtRef = dto.CoverArtRef,
                    Genre = dto.Genre,
                    LabelName = dto.LabelName,
                    CLine = dto.CLine,
                    PLine = dto.PLine,
                    CreatedBy = userId,
                    Status = "DRAFT"
                };

                // Save to Firestore
                await _firestore.Collection("releases").Document(release.Id).SetAsync(release);

                _logger.LogInformation($"Created release: {release.Id} by {userId}");

                return CreatedAtAction(nameof(GetRelease), new { id = release.Id }, release);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating release");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/tracks")]
        public async Task<IActionResult> AddTrack(string id, [FromBody] CreateTrackDto dto)
        {
            try
            {
                var track = new Track
                {
                    ReleaseId = id,
                    Title = dto.Title,
                    Isrc = dto.Isrc,
                    SequenceNumber = dto.SequenceNumber,
                    DurationSeconds = dto.DurationSeconds,
                    Explicit = dto.Explicit ?? false,
                    AudioRef = dto.AudioRef,
                    Contributors = dto.Contributors ?? new(),
                    ComposerName = dto.ComposerName,
                    ProducerName = dto.ProducerName,
                    IsCover = dto.IsCover ?? false,
                    OriginalArtist = dto.OriginalArtist
                };

                await _firestore.Collection("releases").Document(id).Collection("tracks").Document(track.Id).SetAsync(track);

                return CreatedAtAction(nameof(GetRelease), new { id }, track);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding track");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/validate")]
        public async Task<IActionResult> ValidateRelease(string id)
        {
            try
            {
                // Fetch release
                var releaseDoc = await _firestore.Collection("releases").Document(id).GetSnapshotAsync();
                if (!releaseDoc.Exists)
                    return NotFound();

                var release = releaseDoc.ConvertTo<Release>();

                // Fetch tracks
                var tracksSnapshot = await _firestore.Collection("releases").Document(id).Collection("tracks").GetSnapshotAsync();
                var tracks = tracksSnapshot.Documents.Select(d => d.ConvertTo<Track>()).ToList();

                // Run QC
                var qcResult = await _qcEngine.ValidateReleaseAsync(release, tracks);

                // Update release status
                var newStatus = qcResult.PassedQc ? "QC_PASSED" : "QC_FAILED";
                await _firestore.Collection("releases").Document(id).UpdateAsync("status", newStatus);

                return Ok(qcResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating release");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{id}/queue")]
        public async Task<IActionResult> QueueDeliveries(string id, [FromBody] QueueDeliveriesDto dto)
        {
            try
            {
                var releaseDoc = await _firestore.Collection("releases").Document(id).GetSnapshotAsync();
                if (!releaseDoc.Exists)
                    return NotFound();

                var release = releaseDoc.ConvertTo<Release>();

                if (release.Status != "QC_PASSED")
                {
                    return BadRequest(new { error = "Release must pass QC before scheduling" });
                }

                await _deliveryOrchestrator.QueueDeliveriesAsync(release, dto.SelectedDsps ?? new());

                return Ok(new { message = "Deliveries queued", releaseId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error queuing deliveries");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRelease(string id)
        {
            try
            {
                var doc = await _firestore.Collection("releases").Document(id).GetSnapshotAsync();
                if (!doc.Exists)
                    return NotFound();

                var release = doc.ConvertTo<Release>();
                return Ok(release);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching release");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}/deliveries")]
        public async Task<IActionResult> GetDeliveries(string id)
        {
            try
            {
                var deliveries = await _deliveryOrchestrator.GetDeliveriesAsync(id);
                return Ok(deliveries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching deliveries");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ListReleases()
        {
            try
            {
                var query = _firestore.Collection("releases").OrderByDescending("createdAt").Limit(50);
                var snapshot = await query.GetSnapshotAsync();
                var releases = snapshot.Documents.Select(d => d.ConvertTo<Release>()).ToList();

                return Ok(releases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing releases");
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    // DTOs
    public class CreateReleaseDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Upc { get; set; }
        public string? ReleaseType { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public string? CoverArtRef { get; set; }
        public string? Genre { get; set; }
        public string? LabelName { get; set; }
        public string? CLine { get; set; }
        public string? PLine { get; set; }
    }

    public class CreateTrackDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Isrc { get; set; }
        public int SequenceNumber { get; set; }
        public int? DurationSeconds { get; set; }
        public bool? Explicit { get; set; }
        public string? AudioRef { get; set; }
        public List<string>? Contributors { get; set; }
        public string? ComposerName { get; set; }
        public string? ProducerName { get; set; }
        public bool? IsCover { get; set; }
        public string? OriginalArtist { get; set; }
    }

    public class QueueDeliveriesDto
    {
        public List<string>? SelectedDsps { get; set; }
    }
}
