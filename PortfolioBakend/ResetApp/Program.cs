using System;
using System.Security.Cryptography;
using Npgsql;

public class Program
{
    public static void Main()
    {
        string connStr = "Host=aws-1-ap-southeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.aatvhytksslqtzqtqgya;Password=Codebuster@1211;SSL Mode=Require;Trust Server Certificate=true";
        string email = "mack96244@gmail.com";
        string newPassword = "admin";
        
        string hashed = BCrypt.Net.BCrypt.HashPassword(newPassword);

        using (var conn = new NpgsqlConnection(connStr))
        {
            conn.Open();
            
            // Check if user exists
            using (var cmd = new NpgsqlCommand("SELECT id, email FROM users", conn))
            using (var reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    Console.WriteLine($"Found User: {reader.GetString(1)}");
                }
            }
            
            // Update password
            using (var cmd = new NpgsqlCommand("UPDATE users SET password = @pass WHERE email = @email", conn))
            {
                cmd.Parameters.AddWithValue("pass", hashed);
                cmd.Parameters.AddWithValue("email", email);
                int rows = cmd.ExecuteNonQuery();
                Console.WriteLine($"Rows updated: {rows}");
            }
        }
    }
}
