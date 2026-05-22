using System;

namespace PortfolioBakend.Models
{
    public class Contact
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Message { get; set; }
        public string Status { get; set; } = "pending"; // pending, success, failed
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public bool IsRead { get; set; } = false;
        public bool IsReplied { get; set; } = false;
        public string Source { get; set; } = "portfolio";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ContactLog
    {
        public int Id { get; set; }
        public int ContactId { get; set; }
        public string LogMessage { get; set; }
        public string LogType { get; set; } // info, error, delivery, system
        public DateTime CreatedAt { get; set; }
    }
}
