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
            _logger.LogInformation("\n====================================================");
            _logger.LogInformation("Background Email Worker is STARTING");
            _logger.LogInformation("====================================================\n");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var emailItem = await _emailQueue.DequeueEmailAsync(stoppingToken);
                    if (emailItem != null)
                    {
                        var sw = Stopwatch.StartNew();
                        _logger.LogInformation("[WORKER] Dequeued email job for: {Email}", emailItem.ToEmail);
                        
                        // We must resolve scoped services from the DI container manually in a BackgroundService
                        using var scope = _serviceProvider.CreateScope();
                        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                        try
                        {
                            _logger.LogInformation("[WORKER] Attempting to send background email...");
                            var success = await emailService.SendEmailAsync(emailItem.ToEmail, emailItem.Subject, emailItem.HtmlMessage);
                            sw.Stop();

                            if (success) 
                            {
                                _logger.LogInformation("[WORKER] ✅ Successfully sent background email to {Email} in {ElapsedMs}ms", emailItem.ToEmail, sw.ElapsedMilliseconds);
                            }
                            else
                            {
                                _logger.LogWarning("[WORKER] ⚠️ SendEmailAsync returned false for {Email}. Email may not have been sent.", emailItem.ToEmail);
                            }
                        }
                        catch (Exception ex)
                        {
                            sw.Stop();
                            _logger.LogError(ex, "[WORKER] ❌ Failed to send background email to {Email} after {ElapsedMs}ms", emailItem.ToEmail, sw.ElapsedMilliseconds);
                            // Implement retry logic here if necessary in the future
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Background Email Worker execution cancelled.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[WORKER] ❌ CRITICAL: Error occurred executing email queue item.");
                }
            }

            _logger.LogInformation("\n====================================================");
            _logger.LogInformation("Background Email Worker is STOPPING");
            _logger.LogInformation("====================================================\n");
        }
    }
}
