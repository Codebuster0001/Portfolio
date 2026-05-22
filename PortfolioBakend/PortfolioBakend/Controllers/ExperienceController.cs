using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.DTOs;
using PortfolioBakend.Models;
using PortfolioBakend.Repositories;
using PortfolioBakend.Services;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExperienceController : ControllerBase
    {
        private readonly IExperienceService _experienceService;

        public ExperienceController(IExperienceService experienceService)
        {
            _experienceService = experienceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var experiences = await _experienceService.GetAllExperiencesAsync();
            return Ok(experiences);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var experience = await _experienceService.GetExperienceByIdAsync(id);
            if (experience == null)
            {
                return NotFound(new { message = "Experience not found" });
            }
            return Ok(experience);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ExperienceCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _experienceService.CreateExperienceAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ExperienceUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updated = await _experienceService.UpdateExperienceAsync(id, dto);
            if (!updated)
            {
                return NotFound(new { message = "Experience not found" });
            }

            return NoContent();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _experienceService.DeleteExperienceAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Experience not found" });
            }

            return NoContent();
        }

        [Authorize]
        [HttpPut("reorder")]
        public async Task<IActionResult> Reorder([FromBody] IEnumerable<ExperienceSortItem> items)
        {
            var success = await _experienceService.ReorderExperiencesAsync(items);
            if (!success)
            {
                return BadRequest(new { message = "Failed to reorder experiences" });
            }
            return NoContent();
        }
    }
}
