using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using PortfolioBakend.Data;
using PortfolioBakend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PortfolioBakend.Models;

namespace PortfolioBakend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableRateLimiting("LoginRateLimit")]
    public class AuthController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly IConfiguration _config;
        private readonly IEmailQueue _emailQueue;
        private readonly ILogger<AuthController> _logger;

        public AuthController(DbHelper db, IConfiguration config, IEmailQueue emailQueue, ILogger<AuthController> logger)
        {
            _db = db;
            _config = config;
            _emailQueue = emailQueue;
            _logger = logger;
        }

        // ✅ LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var email = request.Email?.Trim();
            var password = request.Password;
            var query = "SELECT * FROM users WHERE LOWER(email) = LOWER(@Email)";

            var dt = await _db.ExecuteQueryAsync(query, new[]
            {
                new NpgsqlParameter("@Email", email)
            });

            if (dt.Rows.Count == 0)
                return Unauthorized("User not found");

            var user = dt.Rows[0];
            var hash = user["password"].ToString();

            if (!BCrypt.Net.BCrypt.Verify(password, hash))
                return Unauthorized("Invalid password");

            // 🔐 Generate JWT
            var token = GenerateJwtToken(user["id"].ToString(), email);

            sw.Stop();
            _logger.LogInformation("Login API completed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
            return Ok(new { token });
        }

        // 🔐 FORGOT PASSWORD
        [HttpPost("forgot-password")]
        [EnableRateLimiting("ForgotPasswordLimit")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var email = request.Email?.Trim();
            var query = "SELECT * FROM users WHERE LOWER(email) = LOWER(@Email)";

            var dt = await _db.ExecuteQueryAsync(query, new[]
            {
                new NpgsqlParameter("@Email", email)
            });

            if (dt.Rows.Count == 0)
                return NotFound("Email not registered");

            // 🔑 Generate reset token
            var token = Guid.NewGuid().ToString();
            var expiry = DateTime.UtcNow.AddMinutes(15);

            // Save in DB
            var updateQuery = @"
            UPDATE users 
            SET reset_token = @Token, reset_token_expiry = @Expiry 
            WHERE email = @Email";

            await _db.ExecuteNonQueryAsync(updateQuery, new[]
            {
                new NpgsqlParameter("@Token", token),
                new NpgsqlParameter("@Expiry", expiry),
                new NpgsqlParameter("@Email", email)
            });

            // Prepare email message for background queue
            var resetLink = $"http://localhost:5174/reset-password/{token}";
            var htmlMessage = $@"
            <div style='font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; text-align: center;'>
                <h2 style='color: #333;'>Password Reset Request</h2>
                <p style='color: #555;'>We received a request to reset your password. Click the button below to create a new password. This link will expire in 15 minutes.</p>
                <a href='{resetLink}' style='display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #3b82f6; text-decoration: none; border-radius: 5px; font-weight: bold;'>Reset Password</a>
                <p style='color: #777; font-size: 12px;'>If you did not request this, please ignore this email or contact support.</p>
            </div>";

            // 🔥 FIRE AND FORGET - Queue email instead of waiting
            _emailQueue.EnqueueEmail(new EmailMessage 
            { 
                ToEmail = email, 
                Subject = "Reset Your Password", 
                HtmlMessage = htmlMessage 
            });

            sw.Stop();
            _logger.LogInformation("ForgotPassword API queued email and completed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
            
            // Return immediately
            return Ok(new { message = "Reset link sent to your email" });
        }

        // 🔍 VALIDATE RESET TOKEN
        [HttpGet("validate-reset-token")]
        public async Task<IActionResult> ValidateResetToken([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("Token is required");

            var query = @"
            SELECT * FROM users 
            WHERE reset_token = @Token 
            AND reset_token_expiry > NOW()";

            var dt = await _db.ExecuteQueryAsync(query, new[]
            {
                new NpgsqlParameter("@Token", token)
            });

            if (dt.Rows.Count == 0)
                return BadRequest("Invalid or expired token");

            return Ok(new { message = "Token is valid" });
        }

        // 🔄 RESET PASSWORD
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var token = request.Token;
            var newPassword = request.NewPassword;
            
            var query = @"
            SELECT * FROM users 
            WHERE reset_token = @Token 
            AND reset_token_expiry > NOW()";

            var dt = await _db.ExecuteQueryAsync(query, new[]
            {
            new NpgsqlParameter("@Token", token)
        });

            if (dt.Rows.Count == 0)
                return BadRequest("Invalid or expired token");

            var hash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            var updateQuery = @"
            UPDATE users 
            SET password = @Password,
                reset_token = NULL,
                reset_token_expiry = NULL
            WHERE reset_token = @Token";

            await _db.ExecuteNonQueryAsync(updateQuery, new[]
            {
            new NpgsqlParameter("@Password", hash),
            new NpgsqlParameter("@Token", token)
        });

            return Ok("Password reset successful");
        }

        // 🔑 JWT Generator
        private string GenerateJwtToken(string userId, string email)
        {
            var jwt = _config.GetSection("Jwt");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim("id", userId),
            new Claim(ClaimTypes.Email, email)
        };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiryMinutes"])),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
