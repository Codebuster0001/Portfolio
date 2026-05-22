using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using PortfolioBakend.Models;

namespace PortfolioBakend.DTOs
{
    public class ContactCreateDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150, ErrorMessage = "Name cannot exceed 150 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        [StringLength(255)]
        public string Email { get; set; }

        [Required(ErrorMessage = "Message is required")]
        [MinLength(10, ErrorMessage = "Message must be at least 10 characters long")]
        public string Message { get; set; }

        public string Source { get; set; } = "portfolio";
    }

    public class ContactUpdateStatusDto
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;
    }

    public class ContactReplyDto
    {
        [Required]
        public string Message { get; set; } = string.Empty;
    }

    public class ContactUpdateReadStatusDto
    {
        public bool IsRead { get; set; }
    }

    public class ContactResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public bool IsRead { get; set; }
        public bool IsReplied { get; set; }
        public string Source { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        public IEnumerable<ContactLog> Logs { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
