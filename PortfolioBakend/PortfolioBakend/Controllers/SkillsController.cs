using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.DTOs;
using PortfolioBakend.Services;

namespace PortfolioBakend.Controllers
{
    /// <summary>
    /// REST API controller for Skills.
    /// Public GET — Admin POST/PUT/DELETE (JWT required).
    /// Supports search, category filtering, and pagination.
    /// </summary>
    [Route("api/skills")]
    [ApiController]
    public class SkillsController : ControllerBase
    {
        private readonly SkillsService _service;

        public SkillsController(SkillsService service)
        {
            _service = service;
        }

        // ------------------------------------------------------------------
        // GET /api/skills?search=react&categoryId=1&page=1&pageSize=20
        // Returns paginated skills with optional search and filter (public).
        // ------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllSkills(
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 50;

            try
            {
                var (items, totalCount) = await _service.GetSkillsAsync(search, categoryId, page, pageSize);
                return Ok(new
                {
                    data = items,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalCount,
                        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // GET /api/skills/category/{categoryId}
        // Returns all skills for a specific category, ordered by sort_order (public).
        // ------------------------------------------------------------------
        [HttpGet("category/{categoryId:int}")]
        public async Task<IActionResult> GetSkillsByCategory(int categoryId)
        {
            try
            {
                var skills = await _service.GetSkillsByCategoryAsync(categoryId);
                return Ok(skills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // GET /api/skills/{id}
        // Returns a single skill by id (public).
        // ------------------------------------------------------------------
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSkillById(int id)
        {
            try
            {
                var skill = await _service.GetSkillByIdAsync(id);
                if (skill == null)
                    return NotFound(new { error = "Not Found", message = $"Skill with ID {id} does not exist." });

                return Ok(skill);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // POST /api/skills
        // Creates a new skill (requires JWT token).
        // ------------------------------------------------------------------
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateSkill([FromBody] SkillCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var newId = await _service.CreateSkillAsync(dto);
                return CreatedAtAction(
                    nameof(GetSkillById),
                    new { id = newId },
                    new { id = newId, message = "Skill created successfully." }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // PUT /api/skills/{id}
        // Updates an existing skill (requires JWT token).
        // ------------------------------------------------------------------
        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSkill(int id, [FromBody] SkillUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateSkillAsync(id, dto);
                if (!updated)
                    return NotFound(new { error = "Not Found", message = $"Skill with ID {id} does not exist." });

                return Ok(new { message = $"Skill {id} updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // DELETE /api/skills/{id}
        // Deletes a skill by id (requires JWT token).
        // ------------------------------------------------------------------
        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            try
            {
                var deleted = await _service.DeleteSkillAsync(id);
                if (!deleted)
                    return NotFound(new { error = "Not Found", message = $"Skill with ID {id} does not exist." });

                return Ok(new { message = $"Skill {id} deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // PUT /api/skills/reorder
        // Bulk reorder skills (drag-and-drop). Requires JWT token.
        // Body: [{ "id": 1, "sortOrder": 0 }, ...]
        // ------------------------------------------------------------------
        [Authorize]
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderSkills([FromBody] List<ReorderItem> items)
        {
            try
            {
                var dict = items.ToDictionary(x => x.Id, x => x.SortOrder);
                await _service.ReorderSkillsAsync(dict);
                return Ok(new { message = "Skills reordered successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }
    }
}
