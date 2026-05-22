using System;

namespace PortfolioBakend.Models
{
    public class Experience
    {
        public int Id { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? Duration { get; set; }
        public string? Description { get; set; }
        
        // PostgreSQL array mapped to C# array
        public string[]? Skills { get; set; }
        
        public string? IconName { get; set; }
        public string? IconLibrary { get; set; }
        public string? IconColor { get; set; }
        public string? GradientFrom { get; set; }
        public string? GradientTo { get; set; }
        
        public bool IsCurrent { get; set; }
        public int SortOrder { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
