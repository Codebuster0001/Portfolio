using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.DTOs;
using PortfolioBakend.Services;

namespace PortfolioBakend.Controllers
{
    /// <summary>
    /// REST API controller for Skill Categories.
    /// Public GET — Admin POST/PUT/DELETE (JWT required).
    /// </summary>
    [Route("api/skillcategories")]
    [ApiController]
    public class SkillCategoriesController : ControllerBase
    {
        private readonly SkillsService _service;

        public SkillCategoriesController(SkillsService service)
        {
            _service = service;
        }

        // ------------------------------------------------------------------
        // GET /api/skillcategories
        // Returns all categories with their nested skills (public).
        // ------------------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _service.GetAllCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // GET /api/skillcategories/{id}
        // Returns a single category by id (public).
        // ------------------------------------------------------------------
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            try
            {
                var category = await _service.GetCategoryByIdAsync(id);
                if (category == null)
                    return NotFound(new { error = "Not Found", message = $"Category with ID {id} does not exist." });

                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // POST /api/skillcategories
        // Creates a new skill category (requires JWT token).
        // ------------------------------------------------------------------
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] SkillCategoryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var newId = await _service.CreateCategoryAsync(dto);
                return CreatedAtAction(
                    nameof(GetCategoryById),
                    new { id = newId },
                    new { id = newId, message = "Skill category created successfully." }
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // PUT /api/skillcategories/{id}
        // Updates an existing skill category (requires JWT token).
        // ------------------------------------------------------------------
        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] SkillCategoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateCategoryAsync(id, dto);
                if (!updated)
                    return NotFound(new { error = "Not Found", message = $"Category with ID {id} does not exist." });

                return Ok(new { message = $"Skill category {id} updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // DELETE /api/skillcategories/{id}
        // Deletes a category and cascades to its skills (requires JWT token).
        // ------------------------------------------------------------------
        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var deleted = await _service.DeleteCategoryAsync(id);
                if (!deleted)
                    return NotFound(new { error = "Not Found", message = $"Category with ID {id} does not exist." });

                return Ok(new { message = $"Skill category {id} and its skills deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        // ------------------------------------------------------------------
        // PUT /api/skillcategories/reorder
        // Bulk reorder categories (drag-and-drop). Requires JWT token.
        // Body: [{ "id": 1, "sortOrder": 0 }, ...]
        // ------------------------------------------------------------------
        [Authorize]
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderCategories([FromBody] List<ReorderItem> items)
        {
            try
            {
                var dict = items.ToDictionary(x => x.Id, x => x.SortOrder);
                await _service.ReorderCategoriesAsync(dict);
                return Ok(new { message = "Categories reordered successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }
    }

    /// <summary>Helper DTO for bulk reorder operations.</summary>
    public record ReorderItem(int Id, int SortOrder);
}
