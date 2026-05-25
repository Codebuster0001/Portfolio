using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace PortfolioBakend.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration config)
        {
            var cloudName = config["CloudinarySettings:CloudName"]
                ?? throw new ArgumentNullException("CloudinarySettings:CloudName configuration is missing.");
            var apiKey = config["CloudinarySettings:ApiKey"]
                ?? throw new ArgumentNullException("CloudinarySettings:ApiKey configuration is missing.");
            var apiSecret = config["CloudinarySettings:ApiSecret"]
                ?? throw new ArgumentNullException("CloudinarySettings:ApiSecret configuration is missing.");

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        /// <summary>
        /// Uploads any file type to Cloudinary.
        /// - Images use ImageUploadParams (/image/upload/)
        /// - Videos use VideoUploadParams (/video/upload/)
        /// - PDFs and general files (docx, zip, txt) use RawUploadParams (/raw/upload/)
        /// </summary>
        public async Task<string?> UploadFileAsync(IFormFile file, string folderName = "portfolio")
        {
            if (file == null || file.Length == 0) return null;

            using var stream = file.OpenReadStream();
            var extension = Path.GetExtension(file.FileName).ToLower();
            var contentType = file.ContentType.ToLower();

            var isImage = contentType.StartsWith("image/") || 
                          extension == ".svg" || 
                          extension == ".png" || 
                          extension == ".jpg" || 
                          extension == ".jpeg" || 
                          extension == ".gif" || 
                          extension == ".webp" || 
                          extension == ".bmp";
            var isVideo = contentType.StartsWith("video/") || extension == ".mp4" || extension == ".mov" || extension == ".avi" || extension == ".mkv";

            Console.WriteLine($"[DIAGNOSTICS] Uploading Asset - Name: '{file.FileName}', ContentType: '{file.ContentType}', isImage: {isImage}, isVideo: {isVideo}");

            try
            {
                if (isImage)
                {
                    // Images go under /image/upload/
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = folderName
                    };

                    if (!extension.Contains("svg"))
                    {
                        uploadParams.Transformation = new Transformation().Quality("auto").FetchFormat("auto");
                    }

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        var secureUrl = uploadResult.SecureUrl.ToString();
                        Console.WriteLine($"[DIAGNOSTICS] Cloudinary Image Upload Success: {secureUrl}");
                        return secureUrl;
                    }
                    throw new Exception($"Cloudinary API Image Error: {uploadResult.Error?.Message}");
                }
                else if (isVideo)
                {
                    // Videos go under /video/upload/
                    var uploadParams = new VideoUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = folderName
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        var secureUrl = uploadResult.SecureUrl.ToString();
                        Console.WriteLine($"[DIAGNOSTICS] Cloudinary Video Upload Success: {secureUrl}");
                        return secureUrl;
                    }
                    throw new Exception($"Cloudinary API Video Error: {uploadResult.Error?.Message}");
                }
                else
                {
                    // PDFs and other raw files (docx, zip, txt, mp3) go under /raw/upload/
                    var uploadParams = new RawUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Folder = folderName
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        var secureUrl = uploadResult.SecureUrl.ToString();
                        Console.WriteLine($"[DIAGNOSTICS] Cloudinary Raw (PDF/File) Upload Success: {secureUrl}");
                        return secureUrl;
                    }
                    throw new Exception($"Cloudinary API Raw Error: {uploadResult.Error?.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CLOUDINARY ERROR] Upload failed for '{file.FileName}': {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Uploads multiple files concurrently and returns their secure URLs.
        /// </summary>
        public async Task<List<string>> UploadFilesAsync(IEnumerable<IFormFile> files, string folderName = "portfolio")
        {
            var urls = new List<string>();
            if (files == null) return urls;

            foreach (var file in files)
            {
                var url = await UploadFileAsync(file, folderName);
                if (!string.IsNullOrEmpty(url))
                {
                    urls.Add(url);
                }
            }
            return urls;
        }

        /// <summary>
        /// Deletes an asset from Cloudinary using its secure URL by parsing the public ID and resource type.
        /// </summary>
        public async Task<bool> DeleteFileAsync(string url)
        {
            if (string.IsNullOrEmpty(url)) return false;

            var (publicId, resourceType) = ParseCloudinaryUrl(url);
            if (string.IsNullOrEmpty(publicId))
            {
                Console.WriteLine($"[DIAGNOSTICS] Deletion ignored: URL '{url}' is not a valid Cloudinary resource.");
                return false;
            }

            Console.WriteLine($"[DIAGNOSTICS] Destroying Cloudinary Asset - PublicId: '{publicId}', ResourceType: '{resourceType}'");

            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = resourceType switch
                {
                    "raw" => ResourceType.Raw,
                    "video" => ResourceType.Video,
                    _ => ResourceType.Image
                }
            };

            try
            {
                var result = await _cloudinary.DestroyAsync(deletionParams);
                return result.Result == "ok";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CLOUDINARY ERROR] Deletion failed for '{publicId}': {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Utility to parse public ID and storage category (image, raw, video) out of any Cloudinary secure asset URL.
        /// </summary>
        public (string publicId, string resourceType) ParseCloudinaryUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url)) return ("", "image");

            try
            {
                var uri = new Uri(url);
                var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                
                if (segments.Length >= 4)
                {
                    string resourceType = segments[1].ToLower(); // "image", "raw", "video"
                    
                    int startIndex = 3;
                    if (segments.Length > 4 && segments[3].StartsWith("v", StringComparison.OrdinalIgnoreCase) && long.TryParse(segments[3].Substring(1), out _))
                    {
                        startIndex = 4;
                    }

                    var pathParts = new List<string>();
                    for (int i = startIndex; i < segments.Length; i++)
                    {
                        pathParts.Add(segments[i]);
                    }

                    var fileSegment = pathParts[pathParts.Count - 1];
                    
                    if (resourceType != "raw")
                    {
                        var dotIndex = fileSegment.LastIndexOf('.');
                        if (dotIndex > 0)
                        {
                            pathParts[pathParts.Count - 1] = fileSegment.Substring(0, dotIndex);
                        }
                    }

                    string publicId = string.Join("/", pathParts);
                    return (Uri.UnescapeDataString(publicId), resourceType);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CLOUDINARY URL PARSE WARNING] Failed to parse: {ex.Message}");
            }

            return ("", "image");
        }
    }
}
