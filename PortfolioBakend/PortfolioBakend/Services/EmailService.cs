using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

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
        private readonly HttpClient _httpClient;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = new HttpClient();
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string htmlMessage)
        {
            try
            {
                _logger.LogInformation("Initializing Resend HTTP API...");

                // Pull securely from Environment Variables or appsettings.json
                var apiKey = _configuration["Resend:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    _logger.LogError("❌ Resend API Key is missing from configuration!");
                    return false;
                }
                
                // Resend REQUIRES 'onboarding@resend.dev' for free accounts without a verified domain.
                var fromEmail = _configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";

                var payload = new
                {
                    from = $"Portfolio Admin <{fromEmail}>",
                    to = new[] { to },
                    subject = subject,
                    html = htmlMessage
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                _logger.LogInformation("Sending email via Resend to {To} from {From}...", to, fromEmail);
                
                var response = await _httpClient.PostAsync("https://api.resend.com/emails", content);
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("✅ Resend email dispatched successfully.");
                    _logger.LogInformation("Resend Response: {Response}", responseContent);
                    return true;
                }
                else
                {
                    _logger.LogError("❌ Resend API rejected the email! Status: {StatusCode}. Details: {Details}", response.StatusCode, responseContent);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ CRITICAL ERROR: Failed to send email to {To} via Resend. Exception details: {Message}", to, ex.Message);
                return false;
            }
        }
    }
}
