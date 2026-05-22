using Dapper;
using Microsoft.AspNetCore.Http;
using PortfolioBakend.Data;
using PortfolioBakend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace PortfolioBakend.Services
{
    public class PdfService
    {
        private readonly CloudinaryService _cloudinary;
        private readonly DbHelper _db;

        public PdfService(CloudinaryService cloudinary, DbHelper db)
        {
            _cloudinary = cloudinary;
            _db = db;
        }

        /// <summary>
        /// Generates a professional PDF resume dynamically using QuestPDF, uploads it to Cloudinary,
        /// and stores the secure URL back into the database.
        /// </summary>
        public async Task<string> GenerateAndSaveResumePdfAsync(long heroId)
        {
            // 1. Fetch current hero section data from Supabase using Dapper
            using var connection = _db.CreateConnection();
            var query = @"
                SELECT id as Id, name as Name, role as Role, description as Description, 
                       availability_status as AvailabilityStatus, tech_stack as TechStack, 
                       gradient_from as GradientFrom, gradient_via as GradientVia, 
                       gradient_to as GradientTo, github_url as GithubUrl, 
                       profile_photo as ProfilePhoto, resume_url as ResumeUrl 
                FROM hero_section 
                WHERE id = @Id";

            var hero = await connection.QueryFirstOrDefaultAsync<HeroSection>(query, new { Id = heroId });
            if (hero == null)
            {
                throw new Exception($"Hero section with ID {heroId} not found.");
            }

            // 2. Fetch profile photo bytes from Cloudinary/Internet if it exists
            byte[]? photoBytes = null;
            if (!string.IsNullOrEmpty(hero.ProfilePhoto))
            {
                try
                {
                    using var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(10);
                    photoBytes = await httpClient.GetByteArrayAsync(hero.ProfilePhoto);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PDF SERVICE] Warning: Failed to fetch profile image bytes: {ex.Message}");
                }
            }

            // 3. Generate Temporary PDF Path
            var tempFileName = $"resume_{Guid.NewGuid()}.pdf";
            var tempFilePath = Path.Combine(Path.GetTempPath(), tempFileName);

            // 4. Set QuestPDF License
            QuestPDF.Settings.License = LicenseType.Community;

            // 5. Create and Generate PDF Document
            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);
                    page.DefaultTextStyle(x => x.FontFamily("Helvetica").FontSize(11).FontColor(Colors.Grey.Darken3));

                    // Header: Name, Title, Contacts, and Profile Photo
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Spacing(6);
                            col.Item().Text(hero.Name).FontSize(28).Bold().FontColor("#1E3A8A"); // Deep Corporate Blue
                            col.Item().Text(hero.Role).FontSize(15).SemiBold().FontColor(Colors.Grey.Darken1);
                            
                            if (!string.IsNullOrEmpty(hero.GithubUrl))
                            {
                                col.Item().Text($"GitHub: {hero.GithubUrl}").FontSize(10).FontColor("#2563EB").Underline();
                            }
                            if (!string.IsNullOrEmpty(hero.AvailabilityStatus))
                            {
                                col.Item().Text($"Status: {hero.AvailabilityStatus}").FontSize(10).Italic().FontColor("#10B981");
                            }
                        });

                        if (photoBytes != null && photoBytes.Length > 0)
                        {
                            row.ConstantItem(85).Height(85).Image(photoBytes);
                        }
                    });

                    // Main Content Section
                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Spacing(18);

                        // Horizontal rule divider
                        col.Item().LineHorizontal(1.5f).LineColor(Colors.Grey.Lighten2);

                        // Profile / About Section
                        col.Item().Column(aboutCol =>
                        {
                            aboutCol.Spacing(6);
                            aboutCol.Item().Text("Professional Summary").FontSize(14).Bold().FontColor("#1E3A8A");
                            aboutCol.Item().Text(hero.Description).LineHeight(1.5f).FontSize(10.5f).FontColor(Colors.Grey.Darken3);
                        });

                        // Tech Stack Section
                        if (hero.TechStack != null && hero.TechStack.Length > 0)
                        {
                            col.Item().Column(skillsCol =>
                            {
                                skillsCol.Spacing(8);
                                skillsCol.Item().Text("Technical Expertise").FontSize(14).Bold().FontColor("#1E3A8A");
                                
                                skillsCol.Item().Text(string.Join("   •   ", hero.TechStack))
                                         .FontSize(11)
                                         .SemiBold()
                                         .FontColor(Colors.Grey.Darken2);
                            });
                        }

                        // Elegant Note block
                        col.Item().PaddingTop(20).Background(Colors.Grey.Lighten4).Padding(12).Column(noteCol =>
                        {
                            noteCol.Spacing(4);
                            noteCol.Item().Text("Theme Gradient Style").FontSize(9).Bold().FontColor(Colors.Grey.Darken1);
                            noteCol.Item().Text($"This profile utilizes your designated UI theme style from '{hero.GradientFrom}' to '{hero.GradientTo}' for frontend portfolio rendering.")
                                         .FontSize(9).Italic().FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // Footer Section
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Generated Dynamically via Portfolio Backend | Powered by QuestPDF").FontSize(8.5f).FontColor(Colors.Grey.Lighten1);
                    });
                });
            }).GeneratePdf(tempFilePath);

            // 6. Read and upload the generated PDF to Cloudinary
            string secureCloudinaryUrl = "";
            try
            {
                var fileBytes = await File.ReadAllBytesAsync(tempFilePath);
                var ms = new MemoryStream(fileBytes);
                
                var formFile = new FormFile(ms, 0, fileBytes.Length, "file", tempFileName)
                {
                    Headers = new HeaderDictionary(),
                    ContentType = "application/pdf"
                };

                var uploadUrl = await _cloudinary.UploadFileAsync(formFile);
                if (string.IsNullOrEmpty(uploadUrl))
                {
                    throw new Exception("Cloudinary returned a null or empty secure URL.");
                }

                secureCloudinaryUrl = uploadUrl;
            }
            finally
            {
                if (File.Exists(tempFilePath))
                {
                    File.Delete(tempFilePath);
                }
            }

            // 7. Update resume_url back to Supabase using Dapper
            var updateQuery = "UPDATE hero_section SET resume_url = @ResumeUrl WHERE id = @Id";
            await connection.ExecuteAsync(updateQuery, new { ResumeUrl = secureCloudinaryUrl, Id = heroId });

            return secureCloudinaryUrl;
        }
    }
}
