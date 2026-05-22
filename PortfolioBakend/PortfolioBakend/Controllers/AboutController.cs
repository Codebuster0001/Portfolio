using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using PortfolioBakend.Data;
using PortfolioBakend.Models;
using System.Data;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AboutController : ControllerBase
    {
        private readonly DbHelper _db;

        public AboutController(DbHelper db)
        {
            _db = db;
        }

        // ============================================
        // 1. ABOUT CONTENT (Main section info)
        // ============================================

        [HttpGet("content")]
        public async Task<IActionResult> GetAboutContent()
        {
            var query = "SELECT id, title, subtitle, description, created_at FROM about_content ORDER BY created_at DESC LIMIT 1";
            var dt = await _db.ExecuteQueryAsync(query);

            if (dt.Rows.Count == 0)
                return NotFound("No about content found.");

            var row = dt.Rows[0];
            return Ok(new AboutContent
            {
                Id = Guid.Parse(row["id"].ToString()),
                Title = row["title"].ToString(),
                Subtitle = row["subtitle"].ToString(),
                Description = row["description"].ToString(),
                CreatedAt = Convert.ToDateTime(row["created_at"])
            });
        }

        [Authorize]
        [HttpPut("content/{id}")]
        public async Task<IActionResult> UpdateAboutContent(Guid id, [FromBody] AboutContent req)
        {
            var query = @"UPDATE about_content 
                          SET title = @Title, subtitle = @Subtitle, description = @Description 
                          WHERE id = @Id";

            var parameters = new[]
            {
                new NpgsqlParameter("@Title", req.Title),
                new NpgsqlParameter("@Subtitle", req.Subtitle),
                new NpgsqlParameter("@Description", req.Description),
                new NpgsqlParameter("@Id", id)
            };

            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            if (affected > 0)
                return Ok(new { message = "About content updated successfully." });

            return BadRequest("Failed to update about content.");
        }

        // ============================================
        // 2. ABOUT SKILLS
        // ============================================

        [HttpGet("skills")]
        public async Task<IActionResult> GetAboutSkills()
        {
            var query = "SELECT id, title, description, icon, created_at FROM about_skills ORDER BY created_at ASC";
            var dt = await _db.ExecuteQueryAsync(query);

            var list = new List<AboutSkill>();
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new AboutSkill
                {
                    Id = Guid.Parse(row["id"].ToString()),
                    Title = row["title"].ToString(),
                    Description = row["description"].ToString(),
                    Icon = row["icon"].ToString(),
                    CreatedAt = Convert.ToDateTime(row["created_at"])
                });
            }

            return Ok(list);
        }

        [Authorize]
        [HttpPost("skills")]
        public async Task<IActionResult> AddAboutSkill([FromBody] AboutSkill req)
        {
            var query = @"INSERT INTO about_skills (title, description, icon) 
                          VALUES (@Title, @Description, @Icon) RETURNING id";

            var parameters = new[]
            {
                new NpgsqlParameter("@Title", req.Title),
                new NpgsqlParameter("@Description", req.Description ?? (object)DBNull.Value),
                new NpgsqlParameter("@Icon", req.Icon ?? (object)DBNull.Value)
            };

            var newId = await _db.ExecuteScalarAsync<Guid>(query, parameters);
            req.Id = newId;

            return Created("", req);
        }

        [Authorize]
        [HttpPut("skills/{id}")]
        public async Task<IActionResult> UpdateAboutSkill(Guid id, [FromBody] AboutSkill req)
        {
            var query = @"UPDATE about_skills 
                          SET title = @Title, description = @Description, icon = @Icon 
                          WHERE id = @Id";

            var parameters = new[]
            {
                new NpgsqlParameter("@Title", req.Title),
                new NpgsqlParameter("@Description", req.Description ?? (object)DBNull.Value),
                new NpgsqlParameter("@Icon", req.Icon ?? (object)DBNull.Value),
                new NpgsqlParameter("@Id", id)
            };

            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            if (affected > 0) return Ok(new { message = "Skill updated successfully." });

            return BadRequest("Failed to update skill.");
        }

        [Authorize]
        [HttpDelete("skills/{id}")]
        public async Task<IActionResult> DeleteAboutSkill(Guid id)
        {
            var query = "DELETE FROM about_skills WHERE id = @Id";
            var affected = await _db.ExecuteNonQueryAsync(query, new[] { new NpgsqlParameter("@Id", id) });

            if (affected > 0) return Ok(new { message = "Skill deleted." });

            return BadRequest("Failed to delete skill.");
        }

        // ============================================
        // 3. STATS
        // ============================================

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var query = "SELECT id, label, value, suffix, icon, created_at FROM stats ORDER BY created_at ASC";
            var dt = await _db.ExecuteQueryAsync(query);

            var list = new List<Stat>();
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new Stat
                {
                    Id = Guid.Parse(row["id"].ToString()),
                    Label = row["label"].ToString(),
                    Value = Convert.ToInt32(row["value"]),
                    Suffix = row["suffix"].ToString(),
                    Icon = row["icon"].ToString(),
                    CreatedAt = Convert.ToDateTime(row["created_at"])
                });
            }

            return Ok(list);
        }

        [Authorize]
        [HttpPost("stats")]
        public async Task<IActionResult> AddStat([FromBody] Stat req)
        {
            var query = @"INSERT INTO stats (label, value, suffix, icon) 
                          VALUES (@Label, @Value, @Suffix, @Icon) RETURNING id";

            var parameters = new[]
            {
                new NpgsqlParameter("@Label", req.Label),
                new NpgsqlParameter("@Value", req.Value),
                new NpgsqlParameter("@Suffix", req.Suffix ?? (object)DBNull.Value),
                new NpgsqlParameter("@Icon", req.Icon ?? (object)DBNull.Value)
            };

            var newId = await _db.ExecuteScalarAsync<Guid>(query, parameters);
            req.Id = newId;

            return Created("", req);
        }

        [Authorize]
        [HttpPut("stats/{id}")]
        public async Task<IActionResult> UpdateStat(Guid id, [FromBody] Stat req)
        {
            var query = @"UPDATE stats 
                          SET label = @Label, value = @Value, suffix = @Suffix, icon = @Icon 
                          WHERE id = @Id";

            var parameters = new[]
            {
                new NpgsqlParameter("@Label", req.Label),
                new NpgsqlParameter("@Value", req.Value),
                new NpgsqlParameter("@Suffix", req.Suffix ?? (object)DBNull.Value),
                new NpgsqlParameter("@Icon", req.Icon ?? (object)DBNull.Value),
                new NpgsqlParameter("@Id", id)
            };

            var affected = await _db.ExecuteNonQueryAsync(query, parameters);
            if (affected > 0) return Ok(new { message = "Stat updated successfully." });

            return BadRequest("Failed to update stat.");
        }

        [Authorize]
        [HttpDelete("stats/{id}")]
        public async Task<IActionResult> DeleteStat(Guid id)
        {
            var query = "DELETE FROM stats WHERE id = @Id";
            var affected = await _db.ExecuteNonQueryAsync(query, new[] { new NpgsqlParameter("@Id", id) });

            if (affected > 0) return Ok(new { message = "Stat deleted." });

            return BadRequest("Failed to delete stat.");
        }
    }
}
