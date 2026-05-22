using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using PortfolioBakend.Data;
using PortfolioBakend.Repositories;
using PortfolioBakend.Services;
using QuestPDF.Infrastructure;
using System.Text;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;

// =========================================================================
// 🚀 DYNAMIC PORT OCCUPATION & HEALTH CHECKS
// =========================================================================
var port = 5225;
var isPortFree = true;
try
{
    using var tcpListener = new System.Net.Sockets.TcpListener(System.Net.IPAddress.Loopback, port);
    tcpListener.Start();
    tcpListener.Stop();
}
catch (System.Net.Sockets.SocketException)
{
    isPortFree = false;
}

if (!isPortFree)
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine("┌────────────────────────────────────────────────────────────────────────┐");
    Console.WriteLine("│ ⚠️  PORT BINDING WARNING: PORT 5225 IS ALREADY IN USE                   │");
    Console.WriteLine("├────────────────────────────────────────────────────────────────────────┤");
    Console.WriteLine("│ Another development process is occupying port 5225 on your system.      │");
    Console.WriteLine("│                                                                        │");
    Console.WriteLine("│ 👉 HOW TO RESOLVE IN POWERSHELL:                                       │");
    Console.WriteLine("│ 1. Run: Get-Process -Name \"*PortfolioBakend*\" | Stop-Process -Force   │");
    Console.WriteLine("│ 2. Run: Stop-Process -Id <PID> -Force (using the active locked PID)    │");
    Console.WriteLine("└────────────────────────────────────────────────────────────────────────┘");
    Console.ResetColor();
}

var builder = WebApplication.CreateBuilder(args);

// Add Output Caching
builder.Services.AddOutputCache(options =>
{
    // Default caching policy: Cache for 5 minutes
    options.AddBasePolicy(builder => 
        builder.Expire(TimeSpan.FromMinutes(5)));
        
    // Specific named policy for heavy endpoints (cache for 1 hour)
    options.AddPolicy("LongCache", builder => 
        builder.Expire(TimeSpan.FromHours(1)));
});

// Add Response Compression (Brotli + Gzip)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

// Configure compression levels
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

// Add services to the container.
builder.Services.AddControllers();

// Configure Swagger with JWT Bearer security integration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Portfolio Dynamic Core API", 
        Version = "v1",
        Description = "Production-level ASP.NET Core 8 Backend for Personal Portfolios."
    });

    // Register JWT Bearer authorization in Swagger UI
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1Ni...\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure core database helper and services
builder.Services.AddSingleton<DbHelper>();
builder.Services.AddSingleton<CloudinaryService>();
builder.Services.AddTransient<PdfService>(); // Register dynamic resume PDF service

// ✅ Skills Management System — Repository + Service
builder.Services.AddScoped<SkillsRepository>();
builder.Services.AddScoped<SkillsService>();

// ✅ Experience Management System — Repository + Service
builder.Services.AddScoped<IExperienceRepository, ExperienceRepository>();
builder.Services.AddScoped<IExperienceService, ExperienceService>();

// ✅ Contact Management System
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IContactService, ContactService>();

// Set up QuestPDF license on startup
QuestPDF.Settings.License = LicenseType.Community;

var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]))
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT ERROR] Authentication failed: {context.Exception.Message}");
                if (context.Exception.InnerException != null)
                {
                    Console.WriteLine($"[JWT ERROR] Inner Exception: {context.Exception.InnerException.Message}");
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("LoginRateLimit", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(15);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
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

// Enable Output Caching Middleware
app.UseOutputCache();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
