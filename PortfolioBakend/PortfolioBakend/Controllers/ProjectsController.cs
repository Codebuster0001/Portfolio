using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.Data;
using PortfolioBakend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectsController : ControllerBase
    {
        private readonly DbHelper _db;

        public ProjectsController(DbHelper db)
        {
            _db = db;
        }

        /// <summary>
        /// Retrieves all projects sorted by Featured status and Project Date (Public endpoint).
        /// </summary>
        [HttpGet]
        [ResponseCache(Duration = 300)]
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {
                using var connection = _db.CreateConnection();
                var query = @"
                    SELECT id as Id, title as Title, description as Description,
                           tech_stack as TechStack, main_image as MainImage,
                           project_images as ProjectImages, project_date::timestamp as ProjectDate,
                           features as Features, github_url as GithubUrl,
                           live_url as LiveUrl, category as Category,
                           is_featured as IsFeatured, created_at as CreatedAt,
                           updated_at as UpdatedAt
                    FROM projects
                    ORDER BY is_featured DESC, project_date DESC, created_at DESC";

                var projects = await connection.QueryAsync<Project>(query);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves a single project by its ID (Public endpoint).
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            try
            {
                using var connection = _db.CreateConnection();
                var query = @"
                    SELECT id as Id, title as Title, description as Description,
                           tech_stack as TechStack, main_image as MainImage,
                           project_images as ProjectImages, project_date::timestamp as ProjectDate,
                           features as Features, github_url as GithubUrl,
                           live_url as LiveUrl, category as Category,
                           is_featured as IsFeatured, created_at as CreatedAt,
                           updated_at as UpdatedAt
                    FROM projects
                    WHERE id = @Id";

                var project = await connection.QueryFirstOrDefaultAsync<Project>(query, new { Id = id });
                if (project == null)
                {
                    return NotFound(new { error = "Not Found", message = $"Project with ID {id} does not exist." });
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new project in the database (Requires Admin Token).
        /// </summary>
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectUpsertRequest req)
        {
            if (req == null)
            {
                return BadRequest(new { error = "Validation Error", message = "Request body cannot be null." });
            }

            // Validations
            if (string.IsNullOrWhiteSpace(req.Title))
            {
                return BadRequest(new { error = "Validation Error", message = "Project Title is required." });
            }
            if (string.IsNullOrWhiteSpace(req.Description))
            {
                return BadRequest(new { error = "Validation Error", message = "Project Description is required." });
            }
            if (string.IsNullOrWhiteSpace(req.MainImage))
            {
                return BadRequest(new { error = "Validation Error", message = "Main Project image is required." });
            }

            try
            {
                using var connection = _db.CreateConnection();
                var query = @"
                    INSERT INTO projects (
                        title, description, tech_stack, main_image, project_images,
                        project_date, features, github_url, live_url, category, is_featured
                    )
                    VALUES (
                        @Title, @Description, @TechStack, @MainImage, @ProjectImages,
                        @ProjectDate, @Features, @GithubUrl, @LiveUrl, @Category, @IsFeatured
                    )
                    RETURNING id;";

                var newId = await connection.ExecuteScalarAsync<int>(query, new
                {
                    req.Title,
                    req.Description,
                    req.TechStack,
                    req.MainImage,
                    req.ProjectImages,
                    req.ProjectDate,
                    req.Features,
                    req.GithubUrl,
                    req.LiveUrl,
                    req.Category,
                    req.IsFeatured
                });

                return CreatedAtAction(nameof(GetProjectById), new { id = newId }, new { id = newId, message = "Project created successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing project in the database (Requires Admin Token).
        /// </summary>
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectUpsertRequest req)
        {
            if (req == null)
            {
                return BadRequest(new { error = "Validation Error", message = "Request body cannot be null." });
            }

            // Validations
            if (string.IsNullOrWhiteSpace(req.Title))
            {
                return BadRequest(new { error = "Validation Error", message = "Project Title is required." });
            }
            if (string.IsNullOrWhiteSpace(req.Description))
            {
                return BadRequest(new { error = "Validation Error", message = "Project Description is required." });
            }
            if (string.IsNullOrWhiteSpace(req.MainImage))
            {
                return BadRequest(new { error = "Validation Error", message = "Main Project image is required." });
            }

            try
            {
                using var connection = _db.CreateConnection();
                var query = @"
                    UPDATE projects SET
                        title          = @Title,
                        description    = @Description,
                        tech_stack     = @TechStack,
                        main_image     = @MainImage,
                        project_images = @ProjectImages,
                        project_date   = @ProjectDate,
                        features       = @Features,
                        github_url     = @GithubUrl,
                        live_url       = @LiveUrl,
                        category       = @Category,
                        is_featured    = @IsFeatured,
                        updated_at     = NOW()
                    WHERE id = @Id";

                var affected = await connection.ExecuteAsync(query, new
                {
                    req.Title,
                    req.Description,
                    req.TechStack,
                    req.MainImage,
                    req.ProjectImages,
                    req.ProjectDate,
                    req.Features,
                    req.GithubUrl,
                    req.LiveUrl,
                    req.Category,
                    req.IsFeatured,
                    Id = id
                });

                if (affected > 0)
                {
                    return Ok(new { message = $"Project with ID {id} updated successfully." });
                }

                return NotFound(new { error = "Update Failed", message = $"Project with ID {id} does not exist." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a project from the database (Requires Admin Token).
        /// </summary>
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                using var connection = _db.CreateConnection();
                var query = "DELETE FROM projects WHERE id = @Id";
                var affected = await connection.ExecuteAsync(query, new { Id = id });

                if (affected > 0)
                {
                    return Ok(new { message = $"Project with ID {id} deleted successfully." });
                }

                return NotFound(new { error = "Delete Failed", message = $"Project with ID {id} does not exist." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Database Error", message = ex.Message });
            }
        }
    }
}
