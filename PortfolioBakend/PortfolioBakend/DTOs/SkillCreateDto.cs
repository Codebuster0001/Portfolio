using System.ComponentModel.DataAnnotations;

namespace PortfolioBakend.DTOs
{
    /// <summary>
    /// DTO for creating a new skill entry.
    /// </summary>
    public class SkillCreateDto
    {
        [Required(ErrorMessage = "Category ID is required.")]
        public int CategoryId { get; set; }

        [Required(ErrorMessage = "Skill name is required.")]
        [MaxLength(100, ErrorMessage = "Skill name cannot exceed 100 characters.")]
        public string SkillName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? IconName { get; set; }

        [MaxLength(50)]
        public string? IconLibrary { get; set; }

        [MaxLength(50)]
        public string? IconColor { get; set; }

        [MaxLength(50)]
        public string? BgColor { get; set; }

        [MaxLength(50)]
        public string? BorderColor { get; set; }

        [Range(0, 100, ErrorMessage = "Proficiency must be between 0 and 100.")]
        public int Proficiency { get; set; } = 80;

        [Range(0, 9999)]
        public int SortOrder { get; set; } = 0;
    }
}
