using System;

namespace PortfolioBakend.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string[] TechStack { get; set; } = Array.Empty<string>();
        public string MainImage { get; set; } = "";
        public string[] ProjectImages { get; set; } = Array.Empty<string>();
        public DateTime? ProjectDate { get; set; }
        public string[] Features { get; set; } = Array.Empty<string>();
        public string? GithubUrl { get; set; }
        public string? LiveUrl { get; set; }
        public string? Category { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ProjectUpsertRequest
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string[] TechStack { get; set; } = Array.Empty<string>();
        public string MainImage { get; set; } = "";
        public string[] ProjectImages { get; set; } = Array.Empty<string>();
        public DateTime? ProjectDate { get; set; }
        public string[] Features { get; set; } = Array.Empty<string>();
        public string? GithubUrl { get; set; }
        public string? LiveUrl { get; set; }
        public string? Category { get; set; }
        public bool IsFeatured { get; set; }
    }
}
