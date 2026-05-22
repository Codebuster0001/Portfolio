using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using PortfolioBakend.Data;
using PortfolioBakend.Models;
using PortfolioBakend.DTOs;

namespace PortfolioBakend.Repositories
{
    public interface IContactRepository
    {
        Task<Contact> CreateContactAsync(Contact contact);
        Task<ContactResponseDto> GetContactByIdAsync(int id);
        Task<(IEnumerable<Contact> Items, int TotalCount)> GetContactsAsync(int page, int pageSize, string search, string status);
        Task<bool> UpdateStatusAsync(int id, string status);
        Task<bool> MarkAsReadAsync(int id, bool isRead);
        Task<bool> MarkAsRepliedAsync(int id, bool isReplied);
        Task<bool> DeleteContactAsync(int id);
        Task LogActionAsync(int contactId, string message, string type);
        Task<IEnumerable<ContactLog>> GetContactLogsAsync(int contactId);
    }

    public class ContactRepository : IContactRepository
    {
        private readonly DbHelper _db;

        public ContactRepository(DbHelper db)
        {
            _db = db;
        }

        public async Task<Contact> CreateContactAsync(Contact contact)
        {
            const string sql = @"
                INSERT INTO contacts (name, email, message, status, ip_address, user_agent, source)
                VALUES (@Name, @Email, @Message, @Status, @IpAddress, @UserAgent, @Source)
                RETURNING *;";

            using var conn = _db.CreateConnection();
            return await conn.QuerySingleAsync<Contact>(sql, contact);
        }

        public async Task<ContactResponseDto> GetContactByIdAsync(int id)
        {
            const string sql = @"SELECT * FROM contacts WHERE id = @Id;";
            using var conn = _db.CreateConnection();
            var contact = await conn.QuerySingleOrDefaultAsync<Contact>(sql, new { Id = id });

            if (contact == null) return null;

            var logs = await GetContactLogsAsync(id);

            return new ContactResponseDto
            {
                Id = contact.Id,
                Name = contact.Name,
                Email = contact.Email,
                Message = contact.Message,
                Status = contact.Status,
                IpAddress = contact.IpAddress,
                UserAgent = contact.UserAgent,
                IsRead = contact.IsRead,
                IsReplied = contact.IsReplied,
                Source = contact.Source,
                CreatedAt = contact.CreatedAt,
                UpdatedAt = contact.UpdatedAt,
                Logs = logs
            };
        }

        public async Task<(IEnumerable<Contact> Items, int TotalCount)> GetContactsAsync(int page, int pageSize, string search, string status)
        {
            using var conn = _db.CreateConnection();

            var searchCondition = string.IsNullOrWhiteSpace(search) ? "1=1" : "(name ILIKE @Search OR email ILIKE @Search OR message ILIKE @Search)";
            var statusCondition = string.IsNullOrWhiteSpace(status) || status.ToLower() == "all" ? "1=1" : "status = @Status";

            var countSql = $"SELECT COUNT(*) FROM contacts WHERE {searchCondition} AND {statusCondition};";
            
            var totalCount = await conn.ExecuteScalarAsync<int>(countSql, new { Search = $"%{search}%", Status = status });

            var offset = (page - 1) * pageSize;
            var dataSql = $@"
                SELECT * FROM contacts 
                WHERE {searchCondition} AND {statusCondition}
                ORDER BY created_at DESC 
                LIMIT @Limit OFFSET @Offset;";

            var items = await conn.QueryAsync<Contact>(dataSql, new { Search = $"%{search}%", Status = status, Limit = pageSize, Offset = offset });

            return (items, totalCount);
        }

        public async Task<bool> UpdateStatusAsync(int id, string status)
        {
            const string sql = "UPDATE contacts SET status = @Status, updated_at = NOW() WHERE id = @Id;";
            using var conn = _db.CreateConnection();
            var affectedRows = await conn.ExecuteAsync(sql, new { Id = id, Status = status });
            return affectedRows > 0;
        }

        public async Task<bool> MarkAsReadAsync(int id, bool isRead)
        {
            const string sql = "UPDATE contacts SET is_read = @IsRead, updated_at = NOW() WHERE id = @Id;";
            using var conn = _db.CreateConnection();
            var affectedRows = await conn.ExecuteAsync(sql, new { Id = id, IsRead = isRead });
            return affectedRows > 0;
        }

        public async Task<bool> MarkAsRepliedAsync(int id, bool isReplied)
        {
            const string sql = "UPDATE contacts SET is_replied = @IsReplied, updated_at = NOW() WHERE id = @Id;";
            using var conn = _db.CreateConnection();
            var affectedRows = await conn.ExecuteAsync(sql, new { Id = id, IsReplied = isReplied });
            return affectedRows > 0;
        }

        public async Task<bool> DeleteContactAsync(int id)
        {
            const string sql = "DELETE FROM contacts WHERE id = @Id;";
            using var conn = _db.CreateConnection();
            var affectedRows = await conn.ExecuteAsync(sql, new { Id = id });
            return affectedRows > 0;
        }

        public async Task LogActionAsync(int contactId, string message, string type)
        {
            const string sql = @"
                INSERT INTO contact_logs (contact_id, log_message, log_type)
                VALUES (@ContactId, @LogMessage, @LogType);";
            
            using var conn = _db.CreateConnection();
            await conn.ExecuteAsync(sql, new { ContactId = contactId, LogMessage = message, LogType = type });
        }

        public async Task<IEnumerable<ContactLog>> GetContactLogsAsync(int contactId)
        {
            const string sql = "SELECT * FROM contact_logs WHERE contact_id = @ContactId ORDER BY created_at ASC;";
            using var conn = _db.CreateConnection();
            return await conn.QueryAsync<ContactLog>(sql, new { ContactId = contactId });
        }
    }
}
