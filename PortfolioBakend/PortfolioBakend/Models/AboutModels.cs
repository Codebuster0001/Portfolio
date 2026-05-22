using System.ComponentModel.DataAnnotations;

namespace PortfolioBakend.Models
{
    public class AboutContent
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AboutSkill
    {
        public Guid Id { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class Stat
    {
        public Guid Id { get; set; }
        [Required]
        public string Label { get; set; }
        public int Value { get; set; }
        public string Suffix { get; set; }
        public string Icon { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
