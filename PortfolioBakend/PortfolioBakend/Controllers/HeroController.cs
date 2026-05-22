using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.Data;
using PortfolioBakend.Models;
using PortfolioBakend.Services;
using System;
using System.Threading.Tasks;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HeroController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly PdfService _pdfService;

        public HeroController(DbHelper db, PdfService pdfService)
        {
            _db = db;
            _pdfService = pdfService;
        }

        /// <summary>
        /// Retrieves the latest Hero section landing details (Public endpoint).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetHero()
        {
            try
            {
                using var connection = _db.CreateConnection();
                var query = @"
                    SELECT id as Id, name as Name, role as Role, description as Description,
                           availability_status as AvailabilityStatus, tech_stack as TechStack,
                           gradient_from as GradientFrom, gradient_via as GradientVia,
                           gradient_to as GradientTo, github_url as GithubUrl,
                           linkedin_url as LinkedinUrl, twitter_url as TwitterUrl,
                           instagram_url as InstagramUrl, gmail_address as GmailAddress,
                           profile_photo as ProfilePhoto, resume_url as ResumeUrl,
                           created_at as CreatedAt
                    FROM hero_section
                    ORDER BY created_at DESC LIMIT 1";

                var hero = await connection.QueryFirstOrDefaultAsync<HeroSection>(query);
                if (hero == null)
                {
                    return NotFound(new { error = "Not Found", message = "No hero section data exists yet." });
                }

                return Ok(hero);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Updates the landing Hero section details in Supabase (Requires Admin Token).
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHero(long id, [FromBody] HeroUpdateRequest req)
        {
            if (req == null)
            {
                return BadRequest(new { error = "Validation Error", message = "Request body cannot be null." });
            }

            // Input Model Validation
            if (string.IsNullOrWhiteSpace(req.Name))
            {
                return BadRequest(new { error = "Validation Error", message = "Name is required." });
            }
            if (string.IsNullOrWhiteSpace(req.Role))
            {
                return BadRequest(new { error = "Validation Error", message = "Role title is required." });
            }

            try
            {
                using var connection = _db.CreateConnection();
                var query = @"
                    UPDATE hero_section SET
                        name                = @Name,
                        role                = @Role,
                        description         = @Description,
                        availability_status = @AvailabilityStatus,
                        tech_stack          = @TechStack,
                        gradient_from       = @GradientFrom,
                        gradient_via        = @GradientVia,
                        gradient_to         = @GradientTo,
                        github_url          = @GithubUrl,
                        linkedin_url        = @LinkedinUrl,
                        twitter_url         = @TwitterUrl,
                        instagram_url       = @InstagramUrl,
                        gmail_address       = @GmailAddress,
                        profile_photo       = @ProfilePhoto,
                        resume_url          = @ResumeUrl
                    WHERE id = @Id";

                var affected = await connection.ExecuteAsync(query, new
                {
                    req.Name,
                    req.Role,
                    req.Description,
                    req.AvailabilityStatus,
                    req.TechStack,
                    req.GradientFrom,
                    req.GradientVia,
                    req.GradientTo,
                    req.GithubUrl,
                    req.LinkedinUrl,
                    req.TwitterUrl,
                    req.InstagramUrl,
                    req.GmailAddress,
                    req.ProfilePhoto,
                    req.ResumeUrl,
                    Id = id
                });

                if (affected > 0)
                {
                    return Ok(new { message = "Hero section landing page details updated successfully." });
                }

                return NotFound(new { error = "Update Failed", message = $"Hero section record with ID {id} does not exist." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Automatically generates a modern resume PDF from the active database data,
        /// uploads it to Cloudinary, and saves the new link to the profile (Requires Admin Token).
        /// </summary>
        [Authorize]
        [HttpPost("{id}/generate-resume")]
        public async Task<IActionResult> GenerateResume(long id)
        {
            try
            {
                var generatedResumeUrl = await _pdfService.GenerateAndSaveResumePdfAsync(id);
                return Ok(new 
                { 
                    message = "Resume PDF generated, uploaded, and linked successfully!",
                    resumeUrl = generatedResumeUrl 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "PDF Generation Error", message = ex.Message });
            }
        }
    }
}
