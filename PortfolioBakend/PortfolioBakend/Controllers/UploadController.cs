using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioBakend.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requires admin authentication
    public class UploadController : ControllerBase
    {
        private readonly CloudinaryService _cloudinary;

        // Supported file extension groups
        private static readonly string[] AllowedExtensions = new[]
        {
            ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg",
            ".pdf", ".doc", ".docx", ".zip", ".rar", ".7z",
            ".txt", ".csv", ".mp4", ".mov", ".avi", ".mp3", ".wav"
        };

        private const long MaxFileSizeBytes = 50 * 1024 * 1024; // Generous 50MB file size limit for general uploads

        public UploadController(CloudinaryService cloudinary)
        {
            _cloudinary = cloudinary;
        }

        /// <summary>
        /// Uploads ANY supported file type (image, vector, document, video, or archive) to Cloudinary.
        /// </summary>
        [HttpPost("any")]
        public async Task<IActionResult> UploadAnyFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "Validation Error", message = "No file was uploaded." });
            }

            // 1. File Size Validation
            if (file.Length > MaxFileSizeBytes)
            {
                return BadRequest(new { error = "Validation Error", message = "File size exceeds the maximum limit of 50MB." });
            }

            // 2. Extension Whitelist check
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { 
                    error = "Validation Error", 
                    message = $"File extension '{extension}' is not supported. Supported extensions: {string.Join(", ", AllowedExtensions)}" 
                });
            }

            try
            {
                // 3. Upload file via Cloudinary auto resource_type pipeline
                var secureUrl = await _cloudinary.UploadFileAsync(file);
                if (string.IsNullOrEmpty(secureUrl))
                {
                    return StatusCode(500, new { error = "Upload Error", message = "An error occurred while uploading to Cloudinary." });
                }

                // Parse out public ID and resource type for client reference
                var (publicId, resourceType) = _cloudinary.ParseCloudinaryUrl(secureUrl);

                return Ok(new 
                { 
                    url = secureUrl,
                    publicId = publicId,
                    resourceType = resourceType,
                    fileName = file.FileName,
                    fileSize = file.Length,
                    contentType = file.ContentType
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Retro-compatible single endpoint for backward-compatibility routing to UploadAnyFile.
        /// </summary>
        [HttpPost("single")]
        public async Task<IActionResult> UploadSingle(IFormFile file)
        {
            return await UploadAnyFile(file);
        }

        /// <summary>
        /// Uploads multiple files concurrently and returns their secure Cloudinary metadata.
        /// </summary>
        [HttpPost("multiple")]
        public async Task<IActionResult> UploadMultiple(List<IFormFile> files)
        {
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { error = "Validation Error", message = "No files were uploaded." });
            }

            foreach (var file in files)
            {
                if (file.Length > MaxFileSizeBytes)
                {
                    return BadRequest(new { error = "Validation Error", message = $"File '{file.FileName}' exceeds the 50MB limit." });
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest(new { error = "Validation Error", message = $"Unsupported format for file '{file.FileName}'." });
                }
            }

            try
            {
                var urls = await _cloudinary.UploadFilesAsync(files);
                return Ok(new { urls });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a file from Cloudinary given its secure URL.
        /// </summary>
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteFile([FromQuery] string url)
        {
            if (string.IsNullOrWhiteSpace(url))
            {
                return BadRequest(new { error = "Validation Error", message = "Cloudinary resource URL is required." });
            }

            try
            {
                var success = await _cloudinary.DeleteFileAsync(url);
                if (success)
                {
                    return Ok(new { message = "Asset deleted successfully from Cloudinary." });
                }
                return BadRequest(new { error = "Deletion Failed", message = "Failed to delete asset. Ensure URL is correct and exists." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", message = ex.Message });
            }
        }
    }
}
