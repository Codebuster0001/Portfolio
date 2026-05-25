using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace PortfolioBakend.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string htmlMessage);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string htmlMessage)
        {
            try
            {
                var smtpHost = _configuration["SmtpSettings:Host"];
                var smtpPortStr = _configuration["SmtpSettings:Port"];
                var smtpEmail = _configuration["SmtpSettings:Email"];
                var smtpPass = _configuration["SmtpSettings:Password"];

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpEmail))
                {
                    _logger.LogWarning("SMTP is not configured properly. Email to {To} was skipped.", to);
                    return false;
                }

                int.TryParse(smtpPortStr, out int smtpPort);
                if (smtpPort == 0) smtpPort = 587; // default

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Portfolio Admin", smtpEmail));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = htmlMessage };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                // Enable STARTTLS connection
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(smtpEmail, smtpPass);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email successfully sent to {To}", to);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
                return false;
            }
        }
    }
}
