using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.Data;
using Npgsql;
using System.Text.Json;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(DbHelper db, ILogger<AnalyticsController> logger)
        {
            _db = db;
            _logger = logger;
        }

        [HttpPost("visitor")]
        public async Task<IActionResult> TrackVisitor([FromBody] VisitorData request)
        {
            if (string.IsNullOrEmpty(request.IpHash) || string.IsNullOrEmpty(request.SessionId))
                return BadRequest("ip_hash and session_id are required");

            var query = @"
                INSERT INTO visitors (ip_hash, session_id, last_visit, user_agent, path, referer, country, city)
                VALUES (@IpHash, @SessionId, NOW(), @UserAgent, @Path, @Referer, @Country, @City)
                ON CONFLICT (ip_hash, session_id) 
                DO UPDATE SET 
                    last_visit = NOW(), 
                    path = @Path, 
                    referer = @Referer,
                    visit_count = visitors.visit_count + 1";

            await _db.ExecuteNonQueryAsync(query, new[]
            {
                new NpgsqlParameter("@IpHash", request.IpHash),
                new NpgsqlParameter("@SessionId", request.SessionId),
                new NpgsqlParameter("@UserAgent", request.UserAgent ?? (object)DBNull.Value),
                new NpgsqlParameter("@Path", request.Path ?? (object)DBNull.Value),
                new NpgsqlParameter("@Referer", request.Referer ?? (object)DBNull.Value),
                new NpgsqlParameter("@Country", request.Country ?? (object)DBNull.Value),
                new NpgsqlParameter("@City", request.City ?? (object)DBNull.Value)
            });

            return Ok(new { success = true });
        }

        [HttpPost("event")]
        public async Task<IActionResult> TrackEvent([FromBody] AnalyticsEvent request)
        {
            if (string.IsNullOrEmpty(request.EventName))
                return BadRequest("event_name is required");

            var query = @"
                INSERT INTO analytics_events (event_name, event_data, session_id)
                VALUES (@EventName, @EventData::jsonb, @SessionId)";

            await _db.ExecuteNonQueryAsync(query, new[]
            {
                new NpgsqlParameter("@EventName", request.EventName),
                new NpgsqlParameter("@EventData", JsonSerializer.Serialize(request.EventData ?? new object())),
                new NpgsqlParameter("@SessionId", request.SessionId ?? "unknown")
            });

            return Ok(new { success = true });
        }

        [HttpGet("visitors/count")]
        public async Task<IActionResult> GetVisitorsCount()
        {
            var query = "SELECT COUNT(*) FROM visitors";
            var dt = await _db.ExecuteQueryAsync(query, Array.Empty<NpgsqlParameter>());
            
            if (dt.Rows.Count > 0)
            {
                var count = Convert.ToInt64(dt.Rows[0][0]);
                return Ok(new { count });
            }
            
            return Ok(new { count = 0 });
        }
    }

    public class VisitorData
    {
        public string IpHash { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string? UserAgent { get; set; }
        public string? Path { get; set; }
        public string? Referer { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
    }

    public class AnalyticsEvent
    {
        public string EventName { get; set; } = string.Empty;
        public object? EventData { get; set; }
        public string? SessionId { get; set; }
    }
}
