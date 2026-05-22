using System.ComponentModel.DataAnnotations;

namespace PortfolioBakend.DTOs
{
    public class ExperienceUpdateDto
    {
        [Required]
        [MaxLength(255)]
        public string Role { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Company { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? Duration { get; set; }

        public string? Description { get; set; }

        public string[]? Skills { get; set; }

        [MaxLength(100)]
        public string? IconName { get; set; }

        [MaxLength(100)]
        public string? IconLibrary { get; set; }

        [MaxLength(50)]
        public string? IconColor { get; set; }

        [MaxLength(50)]
        public string? GradientFrom { get; set; }

        [MaxLength(50)]
        public string? GradientTo { get; set; }

        public bool IsCurrent { get; set; }
        
        public int SortOrder { get; set; }
    }
}
