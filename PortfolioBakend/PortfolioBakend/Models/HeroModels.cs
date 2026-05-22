namespace PortfolioBakend.Models
{
    public class HeroSection
    {
        public long Id { get; set; }
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public string Description { get; set; } = "";
        public string AvailabilityStatus { get; set; } = "Available for new opportunities";
        public string[] TechStack { get; set; } = Array.Empty<string>();
        public string GradientFrom { get; set; } = "blue-400";
        public string GradientVia { get; set; } = "purple-500";
        public string GradientTo { get; set; } = "pink-500";
        public string GithubUrl { get; set; } = "";
        public string ProfilePhoto { get; set; } = "";
        public string ResumeUrl { get; set; } = "";
        public string LinkedinUrl { get; set; } = "";
        public string TwitterUrl { get; set; } = "";
        public string InstagramUrl { get; set; } = "";
        public string GmailAddress { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class HeroUpdateRequest
    {
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public string Description { get; set; } = "";
        public string AvailabilityStatus { get; set; } = "";
        public string[] TechStack { get; set; } = Array.Empty<string>();
        public string GradientFrom { get; set; } = "";
        public string GradientVia { get; set; } = "";
        public string GradientTo { get; set; } = "";
        public string GithubUrl { get; set; } = "";
        public string ProfilePhoto { get; set; } = "";
        public string ResumeUrl { get; set; } = "";
        public string LinkedinUrl { get; set; } = "";
        public string TwitterUrl { get; set; } = "";
        public string InstagramUrl { get; set; } = "";
        public string GmailAddress { get; set; } = "";
    }
}
