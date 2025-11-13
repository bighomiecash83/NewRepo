using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace DMF_MUSIC_PLATFORM.Infrastructure.Security.Signing
{
    /// <summary>
    /// HMAC Request Signing Service
    /// Validates signed requests from frontend/clients
    /// Prevents request forgery even if authentication tokens leak
    /// </summary>
    public interface IHmacSigningService
    {
        string GenerateSignature(string timestamp, string nonce, string bodyJson);
        bool VerifySignature(string timestamp, string nonce, string bodyJson, string signature);
        Task VerifyRequestAsync(HttpRequest request);
    }

    public class HmacSignatureException : Exception
    {
        public HmacSignatureException(string message) : base(message) { }
    }

    /// <summary>
    /// Production HMAC signing implementation
    /// Uses SHA-256 with server-side secret
    /// </summary>
    public class HmacSigningService : IHmacSigningService
    {
        private readonly string _sharedSecret;
        private readonly ILogger<HmacSigningService> _logger;
        private const int MaxSkewMs = 60_000; // 1 minute clock skew tolerance
        private const string TimestampHeader = "x-dmf-timestamp";
        private const string NonceHeader = "x-dmf-nonce";
        private const string SignatureHeader = "x-dmf-signature";

        public HmacSigningService(
            string sharedSecret,
            ILogger<HmacSigningService> logger)
        {
            if (string.IsNullOrEmpty(sharedSecret) || sharedSecret.Length < 32)
                throw new ArgumentException("HMAC secret must be at least 32 characters");

            _sharedSecret = sharedSecret;
            _logger = logger;
        }

        /// <summary>
        /// Generate HMAC-SHA256 signature
        /// Format: timestamp.nonce.body_json
        /// </summary>
        public string GenerateSignature(string timestamp, string nonce, string bodyJson)
        {
            try
            {
                // Ensure body is canonical JSON (single-line, no extra spaces)
                var canonicalBody = bodyJson;
                if (!string.IsNullOrEmpty(bodyJson))
                {
                    try
                    {
                        var json = JsonSerializer.Deserialize<object>(bodyJson);
                        canonicalBody = JsonSerializer.Serialize(json);
                    }
                    catch
                    {
                        // If not JSON, use as-is
                        canonicalBody = bodyJson;
                    }
                }

                // Build base string
                var baseString = $"{timestamp}.{nonce}.{canonicalBody}";

                // Compute HMAC-SHA256
                using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_sharedSecret)))
                {
                    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(baseString));
                    var signature = Convert.ToHexString(hash).ToLower();
                    return signature;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating signature: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Verify HMAC signature with timing-safe comparison
        /// </summary>
        public bool VerifySignature(string timestamp, string nonce, string bodyJson, string providedSignature)
        {
            try
            {
                var expectedSignature = GenerateSignature(timestamp, nonce, bodyJson);

                // Timing-safe comparison to prevent timing attacks
                var expected = Encoding.UTF8.GetBytes(expectedSignature);
                var provided = Encoding.UTF8.GetBytes(providedSignature);

                if (expected.Length != provided.Length)
                    return false;

                int result = 0;
                for (int i = 0; i < expected.Length; i++)
                {
                    result |= expected[i] ^ provided[i];
                }

                return result == 0;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error verifying signature: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Verify complete request (headers + signature + clock skew)
        /// Call this in middleware before request is processed
        /// </summary>
        public async Task VerifyRequestAsync(HttpRequest request)
        {
            try
            {
                // Extract headers
                if (!request.Headers.TryGetValue(TimestampHeader, out var tsHeader))
                    throw new HmacSignatureException("Missing x-dmf-timestamp header");

                if (!request.Headers.TryGetValue(NonceHeader, out var nonceHeader))
                    throw new HmacSignatureException("Missing x-dmf-nonce header");

                if (!request.Headers.TryGetValue(SignatureHeader, out var sigHeader))
                    throw new HmacSignatureException("Missing x-dmf-signature header");

                var timestamp = tsHeader.ToString();
                var nonce = nonceHeader.ToString();
                var signature = sigHeader.ToString();

                // Verify timestamp is recent (prevent replay attacks)
                if (!long.TryParse(timestamp, out var tsMs))
                    throw new HmacSignatureException("Invalid timestamp format");

                var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                if (Math.Abs(now - tsMs) > MaxSkewMs)
                    throw new HmacSignatureException($"Request timestamp outside acceptable skew window ({Math.Abs(now - tsMs)}ms)");

                // Read request body
                request.EnableBuffering();
                using (var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true))
                {
                    var bodyJson = await reader.ReadToEndAsync();
                    request.Body.Position = 0; // Reset for handler to read again

                    // Verify signature
                    if (!VerifySignature(timestamp, nonce, bodyJson, signature))
                        throw new HmacSignatureException("Signature verification failed");
                }

                _logger.LogInformation($"Request signature verified (nonce: {nonce})");
            }
            catch (HmacSignatureException ex)
            {
                _logger.LogWarning($"HMAC verification failed: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error verifying request: {ex.Message}");
                throw new HmacSignatureException($"Request verification error: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Middleware to enforce HMAC signing on sensitive endpoints
    /// </summary>
    public class HmacVerificationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<HmacVerificationMiddleware> _logger;
        private readonly IHmacSigningService _hmacService;
        private readonly string[] _protectedPaths;

        public HmacVerificationMiddleware(
            RequestDelegate next,
            ILogger<HmacVerificationMiddleware> logger,
            IHmacSigningService hmacService,
            params string[] protectedPaths)
        {
            _next = next;
            _logger = logger;
            _hmacService = hmacService;
            _protectedPaths = protectedPaths ?? Array.Empty<string>();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Check if request path requires HMAC verification
            var path = context.Request.Path.Value?.ToLower() ?? "";
            var requiresVerification = _protectedPaths.Any(p => path.StartsWith(p.ToLower()));

            if (requiresVerification && context.Request.Method != "GET")
            {
                try
                {
                    await _hmacService.VerifyRequestAsync(context.Request);
                }
                catch (HmacSignatureException ex)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsJsonAsync(new { error = ex.Message });
                    return;
                }
            }

            await _next(context);
        }
    }

    /// <summary>
    /// Extension for easy middleware registration
    /// </summary>
    public static class HmacVerificationExtensions
    {
        public static IApplicationBuilder UseHmacVerification(
            this IApplicationBuilder app,
            params string[] protectedPaths)
        {
            return app.UseMiddleware<HmacVerificationMiddleware>(protectedPaths);
        }

        public static IServiceCollection AddHmacSigning(
            this IServiceCollection services,
            string sharedSecret)
        {
            services.AddSingleton<IHmacSigningService>(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<HmacSigningService>>();
                return new HmacSigningService(sharedSecret, logger);
            });
            return services;
        }
    }
}
