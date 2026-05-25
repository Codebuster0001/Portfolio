using System;
using System.Threading;
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

        private readonly SmtpClient _client;
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _client = new SmtpClient();
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string htmlMessage)
        {
            await _semaphore.WaitAsync();
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
                if (smtpPort == 0) smtpPort = 587;

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Portfolio Admin", smtpEmail));
                message.To.Add(MailboxAddress.Parse(to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = htmlMessage };
                message.Body = bodyBuilder.ToMessageBody();

                if (!_client.IsConnected)
                {
                    await _client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                }

                if (!_client.IsAuthenticated)
                {
                    await _client.AuthenticateAsync(smtpEmail, smtpPass);
                }

                await _client.SendAsync(message);
                
                _logger.LogInformation("Email successfully sent to {To}", to);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
                // Attempt to disconnect if fault occurred so we start fresh next time
                if (_client.IsConnected)
                {
                    await _client.DisconnectAsync(true);
                }
                return false;
            }
            finally
            {
                _semaphore.Release();
            }
        }
    }
}
