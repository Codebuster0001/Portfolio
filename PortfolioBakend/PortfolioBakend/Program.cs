using PortfolioBakend.Extensions;

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

// Register all services from ServiceExtensions.cs
builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline from MiddlewareExtensions.cs
app.ConfigurePipeline();

// Run database and environment validations asynchronously
await app.RunStartupValidationAsync();

app.Run();
