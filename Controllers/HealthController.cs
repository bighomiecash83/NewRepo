using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Threading.Tasks;

namespace DmfMusicPlatform.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        private readonly IMongoClient _mongoClient;
        private readonly IConfiguration _config;

        public HealthController(IMongoClient mongoClient, IConfiguration config)
        {
            _mongoClient = mongoClient;
            _config = config;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var mongoOk = false;

            try
            {
                var db = _mongoClient.GetDatabase("admin");
                var command = new BsonDocument("ping", 1);
                await db.RunCommandAsync<BsonDocument>(command);
                mongoOk = true;
            }
            catch
            {
                mongoOk = false;
            }

            var result = new
            {
                status = "OK",
                mongo = mongoOk ? "OK" : "FAIL",
                env = new
                {
                    hasMongoUri = !string.IsNullOrEmpty(_config["MongoDB:ConnectionString"] ?? System.Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")),
                    hasAppKey = !string.IsNullOrEmpty(_config["DMF_APP_API_KEY"] ?? System.Environment.GetEnvironmentVariable("DMF_APP_API_KEY")),
                    hasOpenAiKey = !string.IsNullOrEmpty(_config["OPENAI_API_KEY"] ?? System.Environment.GetEnvironmentVariable("OPENAI_API_KEY")),
                    hasGeminiKey = !string.IsNullOrEmpty(_config["GEMINI_API_KEY"] ?? System.Environment.GetEnvironmentVariable("GEMINI_API_KEY"))
                }
            };

            return Ok(result);
        }
    }
}
