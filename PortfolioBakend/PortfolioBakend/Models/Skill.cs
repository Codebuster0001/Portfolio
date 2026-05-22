namespace PortfolioBakend.Models
{
    /// <summary>
    /// Represents an individual technical skill (e.g., React, Node.js, Docker).
    /// Maps to the skills table in PostgreSQL.
    /// </summary>
    public class Skill
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string SkillName { get; set; } = string.Empty;
        public string? IconName { get; set; }
        public string? IconLibrary { get; set; }
        public string? IconColor { get; set; }
        public string? BgColor { get; set; }
        public string? BorderColor { get; set; }
        public int Proficiency { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
