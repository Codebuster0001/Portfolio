using PortfolioBakend.Data;
using Npgsql;

namespace PortfolioBakend.Extensions
{
    public static class MiddlewareExtensions
    {
        public static WebApplication ConfigurePipeline(this WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portfolio API v1");
                });
            }

            app.UseHttpsRedirection();

            // Use Response Compression BEFORE caching so cached responses are already compressed
            app.UseResponseCompression();

            app.UseCors("AllowAll");
            app.UseRateLimiter();
            
            app.UseOutputCache();
            
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapMethods("/", new[] { "GET", "HEAD" }, () => Results.Ok(new { status = "API is running", timestamp = DateTime.UtcNow }));
            app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", environment = app.Environment.EnvironmentName, timestamp = DateTime.UtcNow }));

            app.MapControllers();

            return app;
        }

        public static async Task RunStartupValidationAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DbHelper>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            logger.LogInformation("\n====================================================");
            logger.LogInformation("STARTUP VALIDATION AND DEBUGGING");
            logger.LogInformation("====================================================");

            try
            {
                var createIndexesSql = @"
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
                    CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users (reset_token);
                ";
                await db.ExecuteNonQueryAsync(createIndexesSql, Array.Empty<NpgsqlParameter>());
                logger.LogInformation("[STARTUP] ✅ Supabase database connection successful. Indexes verified.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[STARTUP] ❌ Failed to connect to Supabase or create database indexes.");
            }

            var config = app.Services.GetRequiredService<IConfiguration>();
            
            if (string.IsNullOrEmpty(config["Resend:ApiKey"]) || string.IsNullOrEmpty(config["Resend:FromEmail"]))
                logger.LogError("[STARTUP] ❌ Resend configuration is MISSING.");
            else
                logger.LogInformation("[STARTUP] ✅ Resend configuration loaded.");

            if (string.IsNullOrEmpty(config["Jwt:Key"]))
                logger.LogError("[STARTUP] ❌ JWT Secret Key is MISSING.");
            else
                logger.LogInformation("[STARTUP] ✅ JWT configuration loaded.");
            
            logger.LogInformation("====================================================\n");
        }
    }
}
