using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

class Program {
    static async Task Main() {
        try {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Portfolio Admin", "mack96244@gmail.com"));
            message.To.Add(MailboxAddress.Parse("mack96244@gmail.com"));
            message.Subject = "Test Email";
            message.Body = new TextPart("plain") { Text = "Test" };

            using var client = new SmtpClient();
            await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync("mack96244@gmail.com", "odeo dryh vzpc sqnq");
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            Console.WriteLine("Success with spaces");
        } catch(Exception e) {
            Console.WriteLine("Failed with spaces: " + e.Message);
        }
    }
}
