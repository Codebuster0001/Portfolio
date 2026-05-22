using System.ComponentModel.DataAnnotations;

namespace PortfolioBakend.DTOs
{
    /// <summary>
    /// DTO for updating an existing skill category.
    /// </summary>
    public class SkillCategoryUpdateDto
    {
        [Required(ErrorMessage = "Category title is required.")]
        [MaxLength(100, ErrorMessage = "Title cannot exceed 100 characters.")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? IconName { get; set; }

        [MaxLength(50)]
        public string? IconLibrary { get; set; }

        [MaxLength(50)]
        public string? GradientFrom { get; set; }

        [MaxLength(50)]
        public string? GradientTo { get; set; }

        [Range(0, 9999)]
        public int SortOrder { get; set; }
    }
}
