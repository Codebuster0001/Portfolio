using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using PortfolioBakend.DTOs;
using PortfolioBakend.Models;
using PortfolioBakend.Repositories;

namespace PortfolioBakend.Services
{
    public interface IContactService
    {
        Task<Contact> SubmitContactAsync(ContactCreateDto dto, string ipAddress, string userAgent);
        Task<ContactResponseDto> GetContactByIdAsync(int id);
        Task<PaginatedResponse<Contact>> GetContactsAsync(int page, int pageSize, string search, string status);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> MarkAsReadAsync(int id, bool isRead);
        Task<bool> DeleteContactAsync(int id);
        Task<bool> ReplyToContactAsync(int id, string replyMessage);
    }

    public class ContactService : IContactService
    {
        private readonly IContactRepository _contactRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ContactService> _logger;

        public ContactService(IContactRepository contactRepository, IEmailService emailService, IConfiguration configuration, ILogger<ContactService> logger)
        {
            _contactRepository = contactRepository;
            _emailService = emailService;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<Contact> SubmitContactAsync(ContactCreateDto dto, string ipAddress, string userAgent)
        {
            var contact = new Contact
            {
                Name = dto.Name,
                Email = dto.Email,
                Message = dto.Message,
                Status = "pending",
                IpAddress = ipAddress,
                UserAgent = userAgent,
                Source = dto.Source
            };

            var created = await _contactRepository.CreateContactAsync(contact);
            await _contactRepository.LogActionAsync(created.Id, "Contact form submitted", "system");

            var adminEmail = _configuration["SmtpSettings:Email"] ?? "mack96244@gmail.com";

            // Admin Email Template
            var adminEmailHtml = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #121212; color: #ffffff; border-radius: 10px;'>
                    <h2 style='color: #4ade80; border-bottom: 1px solid #333; padding-bottom: 10px;'>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {created.Name}</p>
                    <p><strong>Email:</strong> {created.Email}</p>
                    <p><strong>Date:</strong> {System.DateTime.UtcNow:f} UTC</p>
                    <h3 style='color: #a78bfa; margin-top: 20px;'>Message:</h3>
                    <blockquote style='background-color: #1e1e1e; padding: 15px; border-left: 4px solid #4ade80; border-radius: 4px;'>{created.Message}</blockquote>
                </div>
            ";

            // User Auto-Reply Template
            var userEmailHtml = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; color: #111827; border-radius: 10px;'>
                    <h2 style='color: #3b82f6;'>Hello {created.Name},</h2>
                    <p>Thank you for reaching out! This is an automated confirmation that I have successfully received your message.</p>
                    <p>I will review your inquiry and get back to you as soon as possible (usually within 24-48 hours).</p>
                    <hr style='border: 1px solid #e5e7eb; margin: 20px 0;' />
                    <p style='color: #6b7280; font-size: 14px;'><strong>Your Message:</strong></p>
                    <blockquote style='background-color: #f3f4f6; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; color: #4b5563;'>{created.Message}</blockquote>
                    <br/>
                    <p>Best regards,<br/><strong>Deepak Kushwaha</strong></p>
                </div>
            ";

            var adminEmailSent = await _emailService.SendEmailAsync(adminEmail, $"New Portfolio Contact from {created.Name}", adminEmailHtml);
            var userEmailSent = await _emailService.SendEmailAsync(created.Email, "Thank you for reaching out!", userEmailHtml);

            if (adminEmailSent)
            {
                await _contactRepository.UpdateStatusAsync(created.Id, "success");
                created.Status = "success";
                await _contactRepository.LogActionAsync(created.Id, "Admin and user emails sent successfully", "delivery");
            }
            else
            {
                await _contactRepository.UpdateStatusAsync(created.Id, "failed");
                created.Status = "failed";
                await _contactRepository.LogActionAsync(created.Id, "Failed to send SMTP emails", "error");
            }

            return created;
        }

        public async Task<ContactResponseDto> GetContactByIdAsync(int id)
        {
            return await _contactRepository.GetContactByIdAsync(id);
        }

        public async Task<PaginatedResponse<Contact>> GetContactsAsync(int page, int pageSize, string search, string status)
        {
            var (items, totalCount) = await _contactRepository.GetContactsAsync(page, pageSize, search, status);
            return new PaginatedResponse<Contact>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            var success = await _contactRepository.UpdateStatusAsync(id, status);
            if (success)
            {
                await _contactRepository.LogActionAsync(id, $"Status updated to '{status}'", "system");
            }
            return success;
        }

        public async Task<bool> MarkAsReadAsync(int id, bool isRead)
        {
            var success = await _contactRepository.MarkAsReadAsync(id, isRead);
            if (success)
            {
                var action = isRead ? "Marked as read" : "Marked as unread";
                await _contactRepository.LogActionAsync(id, action, "system");
            }
            return success;
        }

        public async Task<bool> DeleteContactAsync(int id)
        {
            return await _contactRepository.DeleteContactAsync(id);
        }

        public async Task<bool> ReplyToContactAsync(int id, string replyMessage)
        {
            var contact = await _contactRepository.GetContactByIdAsync(id);
            if (contact == null) return false;

            var emailHtml = $@"
                <h2>Reply from Deepak Kushwaha</h2>
                <p>{replyMessage.Replace("\n", "<br/>")}</p>
                <hr style='border: 1px solid #eee; margin: 20px 0;' />
                <p style='color: #777; font-size: 12px;'><strong>You originally wrote:</strong></p>
                <blockquote style='border-left: 4px solid #ccc; padding-left: 10px; color: #555;'>{contact.Message}</blockquote>
            ";

            var emailSent = await _emailService.SendEmailAsync(contact.Email, "Re: Your message to Deepak Kushwaha", emailHtml);
            
            if (emailSent)
            {
                await _contactRepository.MarkAsRepliedAsync(id, true);
                await _contactRepository.LogActionAsync(id, "Reply email sent successfully", "reply");
                return true;
            }
            
            await _contactRepository.LogActionAsync(id, "Failed to send reply email", "error");
            return false;
        }
    }
}
