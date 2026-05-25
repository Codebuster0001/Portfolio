using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
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

        // The user provided this exact API key in the chat
        private const string RESEND_API_KEY = "re_HTZaohFc_LQnAjQYwxmc6pb5aBWZqH3de";

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", RESEND_API_KEY);
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string htmlMessage)
        {
            try
            {
                _logger.LogInformation("Initializing Resend API for email delivery...");

                // Resend API requires onboarding@resend.dev if a custom domain is not verified.
                var payload = new
                {
                    from = "Portfolio Admin <onboarding@resend.dev>",
                    to = new[] { to },
                    subject = subject,
                    html = htmlMessage
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _logger.LogInformation("Sending email via Resend API to {To}...", to);
                
                var response = await _httpClient.PostAsync("https://api.resend.com/emails", content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("✅ Email sent successfully via Resend API.");
                    _logger.LogInformation("Resend response: {Response}", responseBody);
                    return true;
                }
                else
                {
                    _logger.LogError("❌ Resend API rejected the email! Status: {Status}, Response: {Response}", response.StatusCode, responseBody);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ CRITICAL ERROR: Failed to execute Resend API request to {To}. Exception: {Message}", to, ex.Message);
                return false;
            }
        }
    }
}
