using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMF_MUSIC_PLATFORM.Data.Distribution;

namespace DMF_MUSIC_PLATFORM.Infrastructure.Distribution
{
    /// <summary>
    /// QC Engine validates releases against quality standards before distribution.
    /// </summary>
    public interface IQcEngine
    {
        Task<QcResult> ValidateReleaseAsync(Release release, List<Track> tracks);
    }

    public class QcEngine : IQcEngine
    {
        private readonly ILogger<QcEngine> _logger;

        public QcEngine(ILogger<QcEngine> logger)
        {
            _logger = logger;
        }

        public async Task<QcResult> ValidateReleaseAsync(Release release, List<Track> tracks)
        {
            var result = new QcResult { ReleaseId = release.Id };

            try
            {
                // Check 1: UPC format
                if (string.IsNullOrWhiteSpace(release.Upc))
                {
                    result.Checks.Add(new QcResult.QcCheck
                    {
                        Name = "upc_required",
                        Passed = false,
                        Message = "UPC is required for distribution"
                    });
                }
                else if (!IsValidUpc(release.Upc))
                {
                    result.Checks.Add(new QcResult.QcCheck
                    {
                        Name = "upc_format",
                        Passed = false,
                        Message = "UPC format invalid (must be 12 or 13 digits)"
                    });
                }
                else
                {
                    result.Checks.Add(new QcResult.QcCheck { Name = "upc_format", Passed = true });
                }

                // Check 2: Title
                if (string.IsNullOrWhiteSpace(release.Title))
                {
                    result.Checks.Add(new QcResult.QcCheck
                    {
                        Name = "title_required",
                        Passed = false,
                        Message = "Release title is required"
                    });
                }
                else
                {
                    result.Checks.Add(new QcResult.QcCheck { Name = "title_required", Passed = true });
                }

                // Check 3: Artwork
                if (string.IsNullOrWhiteSpace(release.CoverArtRef))
                {
                    result.Checks.Add(new QcResult.QcCheck
                    {
                        Name = "artwork_required",
                        Passed = false,
                        Message = "Cover artwork is required"
                    });
                }
                else
                {
                    result.Checks.Add(new QcResult.QcCheck { Name = "artwork_required", Passed = true });
                }

                // Check 4: Tracks
                if (!tracks.Any())
                {
                    result.Checks.Add(new QcResult.QcCheck
                    {
                        Name = "tracks_required",
                        Passed = false,
                        Message = "Release must have at least 1 track"
                    });
                }
                else
                {
                    result.Checks.Add(new QcResult.QcCheck { Name = "tracks_required", Passed = true });

                    // Check ISRCs
                    var missingIsrc = tracks.Where(t => string.IsNullOrWhiteSpace(t.Isrc)).ToList();
                    if (missingIsrc.Any())
                    {
                        result.Checks.Add(new QcResult.QcCheck
                        {
                            Name = "isrc_missing",
                            Passed = false,
                            Message = $"{missingIsrc.Count} track(s) missing ISRC",
                            Suggestion = "Assign ISRC to all tracks"
                        });
                    }
                    else
                    {
                        result.Checks.Add(new QcResult.QcCheck { Name = "isrc_complete", Passed = true });
                    }

                    // Check audio files
                    var missingAudio = tracks.Where(t => string.IsNullOrWhiteSpace(t.AudioRef)).ToList();
                    if (missingAudio.Any())
                    {
                        result.Checks.Add(new QcResult.QcCheck
                        {
                            Name = "audio_required",
                            Passed = false,
                            Message = $"{missingAudio.Count} track(s) missing audio file"
                        });
                    }
                    else
                    {
                        result.Checks.Add(new QcResult.QcCheck { Name = "audio_complete", Passed = true });
                    }
                }

                // Check 5: Release date
                if (!release.ReleaseDate.HasValue)
                {
                    result.Checks.Add(new QcResult.QcCheck
                    {
                        Name = "release_date_required",
                        Passed = false,
                        Message = "Release date is required"
                    });
                }
                else
                {
                    result.Checks.Add(new QcResult.QcCheck { Name = "release_date_required", Passed = true });
                }

                // Overall pass/fail
                result.PassedQc = result.Checks.All(c => c.Passed);

                _logger.LogInformation($"QC validation for release {release.Id}: {(result.PassedQc ? "PASSED" : "FAILED")}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during QC validation for release {release.Id}");
                result.Checks.Add(new QcResult.QcCheck
                {
                    Name = "validation_error",
                    Passed = false,
                    Message = ex.Message
                });
                result.PassedQc = false;
            }

            await Task.CompletedTask;
            return result;
        }

        private bool IsValidUpc(string upc)
        {
            // Remove non-digits
            var digits = new string(upc.Where(char.IsDigit).ToArray());
            // UPC can be 12 (UPC-A) or 13 (EAN-13) digits
            return digits.Length == 12 || digits.Length == 13;
        }
    }
}
