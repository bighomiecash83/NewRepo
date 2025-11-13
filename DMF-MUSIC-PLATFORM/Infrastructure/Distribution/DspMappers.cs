using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DMF_MUSIC_PLATFORM.Infrastructure.Distribution
{
    /// <summary>Base DSP (Digital Service Provider) payload contract</summary>
    public abstract class DspPayloadBase
    {
        public string TrackId { get; set; }
        public string ArtistName { get; set; }
        public string TrackTitle { get; set; }
        public string AlbumTitle { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string Genre { get; set; }
        public string Language { get; set; }
        public List<DspCredit> Credits { get; set; } = new();
        public DspProducerInfo ProducerInfo { get; set; }
        public DspPublisherInfo PublisherInfo { get; set; }

        /// <summary>Validate payload before sending to DSP</summary>
        public virtual ValidationResult Validate()
        {
            if (string.IsNullOrWhiteSpace(TrackId))
                return new ValidationResult("TrackId is required");

            if (string.IsNullOrWhiteSpace(ArtistName))
                return new ValidationResult("ArtistName is required");

            if (string.IsNullOrWhiteSpace(TrackTitle))
                return new ValidationResult("TrackTitle is required");

            if (ReleaseDate == default)
                return new ValidationResult("ReleaseDate is required");

            return ValidationResult.Success;
        }
    }

    /// <summary>Credit information for contributors</summary>
    public class DspCredit
    {
        public string Name { get; set; }
        public string Role { get; set; } // composer, lyricist, performer, etc.
        public string IPI { get; set; }
        public string Share { get; set; }
    }

    /// <summary>Producer information</summary>
    public class DspProducerInfo
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Affiliation { get; set; }
    }

    /// <summary>Publisher information</summary>
    public class DspPublisherInfo
    {
        public string Name { get; set; }
        public string AffiliationCode { get; set; }
        public string PRO { get; set; } // ASCAP, BMI, SESAC, etc.
    }

    /// <summary>Spotify-specific payload</summary>
    public class SpotifyPayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string ExplicitContent { get; set; }
        public string AudioUrl { get; set; }
        public int TrackDurationMs { get; set; }

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for Spotify");

            if (TrackDurationMs <= 0)
                return new ValidationResult("TrackDurationMs must be greater than 0");

            return ValidationResult.Success;
        }
    }

    /// <summary>Apple Music-specific payload</summary>
    public class AppleMusicPayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string ExplicitContent { get; set; }
        public string AudioUrl { get; set; }
        public int TrackDurationMs { get; set; }
        public string TerritoryAvailability { get; set; }

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for Apple Music");

            return ValidationResult.Success;
        }
    }

    /// <summary>YouTube Content ID-specific payload</summary>
    public class YouTubePayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string VideoUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public bool AllowUGC { get; set; } = true;
        public string ContentIdPolicy { get; set; } = "monetize";

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for YouTube");

            if (!string.IsNullOrEmpty(ContentIdPolicy) &&
                !new[] { "monetize", "block", "track" }.Contains(ContentIdPolicy.ToLower()))
                return new ValidationResult("Invalid ContentIdPolicy");

            return ValidationResult.Success;
        }
    }

    /// <summary>TikTok-specific payload</summary>
    public class TikTokPayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string AudioUrl { get; set; }
        public bool AllowRemixing { get; set; } = true;
        public bool AllowUGC { get; set; } = true;
        public int TrackDurationMs { get; set; }

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for TikTok");

            return ValidationResult.Success;
        }
    }

    /// <summary>Amazon Music-specific payload</summary>
    public class AmazonMusicPayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string AudioUrl { get; set; }
        public int TrackDurationMs { get; set; }

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for Amazon Music");

            return ValidationResult.Success;
        }
    }

    /// <summary>Beatport-specific payload (DJ stores)</summary>
    public class BeatportPayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string BPM { get; set; }
        public string Key { get; set; }
        public string SubGenre { get; set; }
        public string AudioUrl { get; set; }
        public int TrackDurationMs { get; set; }

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for Beatport");

            if (string.IsNullOrWhiteSpace(BPM))
                return new ValidationResult("BPM is required for Beatport");

            return ValidationResult.Success;
        }
    }

    /// <summary>Shazam-specific payload (metadata utility)</summary>
    public class ShazamPayload : DspPayloadBase
    {
        [Required]
        public string IsrcCode { get; set; }

        public string AudioUrl { get; set; }
        public int TrackDurationMs { get; set; }

        public override ValidationResult Validate()
        {
            var baseResult = base.Validate();
            if (baseResult != ValidationResult.Success)
                return baseResult;

            if (string.IsNullOrWhiteSpace(IsrcCode))
                return new ValidationResult("IsrcCode is required for Shazam");

            return ValidationResult.Success;
        }
    }

    /// <summary>DSP Mapper Factory - creates appropriate payload for each DSP</summary>
    public class DspMapperFactory
    {
        /// <summary>Map track metadata to DSP-specific payload</summary>
        public static DspPayloadBase CreatePayload(
            string dspName,
            TrackDistributionData trackData)
        {
            return dspName.ToLower() switch
            {
                "spotify" => MapToSpotify(trackData),
                "apple_music" or "applemusic" => MapToAppleMusic(trackData),
                "youtube" => MapToYouTube(trackData),
                "tiktok" => MapToTikTok(trackData),
                "amazon_music" or "amazonmusic" => MapToAmazonMusic(trackData),
                "beatport" => MapToBeatport(trackData),
                "shazam" => MapToShazam(trackData),
                _ => throw new NotSupportedException($"DSP {dspName} is not supported")
            };
        }

        private static SpotifyPayload MapToSpotify(TrackDistributionData data)
        {
            return new SpotifyPayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                ExplicitContent = data.ExplicitContent,
                TrackDurationMs = data.TrackDurationMs
            };
        }

        private static AppleMusicPayload MapToAppleMusic(TrackDistributionData data)
        {
            return new AppleMusicPayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                ExplicitContent = data.ExplicitContent,
                TrackDurationMs = data.TrackDurationMs,
                TerritoryAvailability = data.TerritoryAvailability
            };
        }

        private static YouTubePayload MapToYouTube(TrackDistributionData data)
        {
            return new YouTubePayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                AllowUGC = data.AllowUGC,
                ContentIdPolicy = data.ContentIdPolicy
            };
        }

        private static TikTokPayload MapToTikTok(TrackDistributionData data)
        {
            return new TikTokPayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                AllowRemixing = data.AllowRemixing,
                AllowUGC = data.AllowUGC,
                TrackDurationMs = data.TrackDurationMs
            };
        }

        private static AmazonMusicPayload MapToAmazonMusic(TrackDistributionData data)
        {
            return new AmazonMusicPayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                TrackDurationMs = data.TrackDurationMs
            };
        }

        private static BeatportPayload MapToBeatport(TrackDistributionData data)
        {
            return new BeatportPayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                BPM = data.BPM,
                Key = data.Key,
                SubGenre = data.SubGenre,
                TrackDurationMs = data.TrackDurationMs
            };
        }

        private static ShazamPayload MapToShazam(TrackDistributionData data)
        {
            return new ShazamPayload
            {
                TrackId = data.TrackId,
                ArtistName = data.ArtistName,
                TrackTitle = data.TrackTitle,
                AlbumTitle = data.AlbumTitle,
                ReleaseDate = data.ReleaseDate,
                Genre = data.Genre,
                Language = data.Language,
                Credits = data.Credits,
                ProducerInfo = data.ProducerInfo,
                PublisherInfo = data.PublisherInfo,
                IsrcCode = data.IsrcCode,
                TrackDurationMs = data.TrackDurationMs
            };
        }
    }

    /// <summary>Input data for DSP mapping</summary>
    public class TrackDistributionData
    {
        public string TrackId { get; set; }
        public string ArtistName { get; set; }
        public string TrackTitle { get; set; }
        public string AlbumTitle { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string Genre { get; set; }
        public string Language { get; set; }
        public string IsrcCode { get; set; }
        public int TrackDurationMs { get; set; }

        public string ExplicitContent { get; set; }
        public string TerritoryAvailability { get; set; }

        public bool AllowUGC { get; set; } = true;
        public bool AllowRemixing { get; set; } = true;
        public string ContentIdPolicy { get; set; } = "monetize";

        public string BPM { get; set; }
        public string Key { get; set; }
        public string SubGenre { get; set; }

        public List<DspCredit> Credits { get; set; } = new();
        public DspProducerInfo ProducerInfo { get; set; }
        public DspPublisherInfo PublisherInfo { get; set; }
    }

    /// <summary>DSP Payload Validator with batch validation</summary>
    public class DspPayloadValidator
    {
        /// <summary>Validate single payload</summary>
        public static ValidationResult ValidatePayload(DspPayloadBase payload)
        {
            if (payload == null)
                return new ValidationResult("Payload cannot be null");

            return payload.Validate();
        }

        /// <summary>Validate multiple payloads for different DSPs</summary>
        public static Dictionary<string, ValidationResult> ValidatePayloads(
            Dictionary<string, DspPayloadBase> payloads)
        {
            var results = new Dictionary<string, ValidationResult>();

            foreach (var kvp in payloads)
            {
                results[kvp.Key] = ValidatePayload(kvp.Value);
            }

            return results;
        }

        /// <summary>Check if all payloads are valid</summary>
        public static bool AreAllValid(Dictionary<string, ValidationResult> validationResults)
        {
            return validationResults.All(kvp => kvp.Value == ValidationResult.Success);
        }
    }
}
