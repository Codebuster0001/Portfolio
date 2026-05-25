using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PortfolioBakend.Services;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace PortfolioBakend.Services
{
    public class BackgroundEmailWorker : BackgroundService
    {
        private readonly IEmailQueue _emailQueue;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BackgroundEmailWorker> _logger;

        public BackgroundEmailWorker(IEmailQueue emailQueue, IServiceProvider serviceProvider, ILogger<BackgroundEmailWorker> logger)
        {
            _emailQueue = emailQueue;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Background Email Worker is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var emailItem = await _emailQueue.DequeueEmailAsync(stoppingToken);
                    if (emailItem != null)
                    {
                        var sw = Stopwatch.StartNew();
                        
                        // We must resolve scoped services from the DI container manually in a BackgroundService
                        using var scope = _serviceProvider.CreateScope();
                        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                        try
                        {
                            await emailService.SendEmailAsync(emailItem.ToEmail, emailItem.Subject, emailItem.HtmlMessage);
                            sw.Stop();
                            _logger.LogInformation("Successfully sent background email to {Email} in {ElapsedMs}ms", emailItem.ToEmail, sw.ElapsedMilliseconds);
                        }
                        catch (Exception ex)
                        {
                            sw.Stop();
                            _logger.LogError(ex, "Failed to send background email to {Email} after {ElapsedMs}ms", emailItem.ToEmail, sw.ElapsedMilliseconds);
                            // Implement retry logic here if necessary in the future
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    // Execution cancelled
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing email queue item.");
                }
            }

            _logger.LogInformation("Background Email Worker is stopping.");
        }
    }
}
