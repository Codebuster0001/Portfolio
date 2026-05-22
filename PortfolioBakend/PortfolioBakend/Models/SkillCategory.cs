namespace PortfolioBakend.Models
{
    /// <summary>
    /// Represents a skill category (e.g., Frontend, Backend, Tools & DevOps).
    /// Maps to the skill_categories table in PostgreSQL.
    /// </summary>
    public class SkillCategory
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? IconName { get; set; }
        public string? IconLibrary { get; set; }
        public string? GradientFrom { get; set; }
        public string? GradientTo { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation: skills belonging to this category (populated by joins)
        public List<Skill> Skills { get; set; } = new();
    }
}
