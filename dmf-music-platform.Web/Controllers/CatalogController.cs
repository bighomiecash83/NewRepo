using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using dmf_music_platform.Web.Services;
using dmf_music_platform.Web.StreamGod;

namespace dmf_music_platform.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly IStreamGodBrain _brain;

        public CatalogController(IStreamGodBrain brain)
        {
            _brain = brain;
        }

        [HttpPost("health")]
        public ActionResult<CatalogHealthResponse> Compute([FromBody] CatalogInput input)
        {
            var result = _brain.ComputeCatalogHealth(input.Artists, input.Releases, input.Tracks);
            return Ok(result);
        }

        [HttpGet("health/sample")]
        public ActionResult<CatalogHealthResponse> Sample()
        {
            var artists = new List<ArtistDto>
            {
                new() { Id = "ART-1", Name = "Du'ryia" },
                new() { Id = "ART-2", Name = "DMF Records" }
            };

            var releases = new List<ReleaseDto>
            {
                new() { Id = "REL-1", Title = "Golden Era", PrimaryArtistId = "ART-1", Upc = "123456789012" },
                new() { Id = "REL-2", Title = "Hula Nights", PrimaryArtistId = "ART-2", CatalogNumber = "DMF-0002" }
            };

            var tracks = new List<TrackDto>
            {
                new() { Id = "TRK-1", Title = "Shine", PrimaryArtistId = "ART-1", ReleaseId = "REL-1", Isrc = "US-DMF-24-00001", DurationSeconds = 210, SongGenre = "Pop", SongSubgenre = "Electropop" },
                new() { Id = "TRK-2", Title = "Wave", PrimaryArtistId = "ART-2", ReleaseId = "REL-2", DurationSeconds = 0, SongGenre = "Urban" }
            };

            var result = _brain.ComputeCatalogHealth(artists, releases, tracks);
            return Ok(result);
        }
    }
}
