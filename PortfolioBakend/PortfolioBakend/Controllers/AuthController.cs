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
        private readonly IEmailService _emailService;

        public AuthController(DbHelper db, IConfiguration config, IEmailService emailService)
        {
            _db = db;
            _config = config;
            _emailService = emailService;
        }

        // ✅ LOGIN
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var email = request.Email;
            var password = request.Password;
            var query = "SELECT * FROM users WHERE email = @Email";

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

            return Ok(new { token });
        }

        // 🔐 FORGOT PASSWORD
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var email = request.Email;
            var query = "SELECT * FROM users WHERE email = @Email";

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

            // Send actual email with reset link
            var resetLink = $"http://localhost:5173/reset-password?token={token}";
            await _emailService.SendEmailAsync(email, "Reset Password", $"Click here: <a href='{resetLink}'>Reset Password</a>");

            // Do not return token to frontend for security reasons
            return Ok(new { message = "Reset link sent to your email" });
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
