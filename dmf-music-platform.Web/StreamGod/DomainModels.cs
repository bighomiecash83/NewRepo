using System;

namespace dmf_music_platform.Web.StreamGod
{
    public class ArtistDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class ReleaseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? PrimaryArtistId { get; set; }
        public string? Upc { get; set; }
        public string? CatalogNumber { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public string? ReleaseGenre { get; set; }
    }

    public class TrackDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? PrimaryArtistId { get; set; }
        public string? ReleaseId { get; set; }
        public string? Isrc { get; set; }
        public int DurationSeconds { get; set; }
        public string? SongGenre { get; set; }
        public string? SongSubgenre { get; set; }
    }

    public class CatalogInput
    {
        public ArtistDto[] Artists { get; set; } = Array.Empty<ArtistDto>();
        public ReleaseDto[] Releases { get; set; } = Array.Empty<ReleaseDto>();
        public TrackDto[] Tracks { get; set; } = Array.Empty<TrackDto>();
    }
}
