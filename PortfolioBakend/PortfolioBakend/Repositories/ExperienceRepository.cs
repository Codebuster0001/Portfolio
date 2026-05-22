using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using PortfolioBakend.Data;
using PortfolioBakend.Models;

namespace PortfolioBakend.Repositories
{
    public interface IExperienceRepository
    {
        Task<IEnumerable<Experience>> GetAllAsync();
        Task<Experience?> GetByIdAsync(int id);
        Task<int> CreateAsync(Experience experience);
        Task<bool> UpdateAsync(Experience experience);
        Task<bool> DeleteAsync(int id);
        Task<bool> ReorderAsync(IEnumerable<ExperienceSortItem> items);
    }

    public class ExperienceSortItem
    {
        public int Id { get; set; }
        public int SortOrder { get; set; }
    }

    public class ExperienceRepository : IExperienceRepository
    {
        private readonly DbHelper _dbHelper;

        public ExperienceRepository(DbHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<IEnumerable<Experience>> GetAllAsync()
        {
            var sql = @"
                SELECT 
                    id AS Id,
                    role AS Role,
                    company AS Company,
                    location AS Location,
                    duration AS Duration,
                    description AS Description,
                    skills AS Skills,
                    icon_name AS IconName,
                    icon_library AS IconLibrary,
                    icon_color AS IconColor,
                    gradient_from AS GradientFrom,
                    gradient_to AS GradientTo,
                    is_current AS IsCurrent,
                    sort_order AS SortOrder,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt
                FROM experiences
                ORDER BY sort_order ASC, created_at DESC;";

            using var connection = _dbHelper.CreateConnection();
            return await connection.QueryAsync<Experience>(sql);
        }

        public async Task<Experience?> GetByIdAsync(int id)
        {
            var sql = @"
                SELECT 
                    id AS Id,
                    role AS Role,
                    company AS Company,
                    location AS Location,
                    duration AS Duration,
                    description AS Description,
                    skills AS Skills,
                    icon_name AS IconName,
                    icon_library AS IconLibrary,
                    icon_color AS IconColor,
                    gradient_from AS GradientFrom,
                    gradient_to AS GradientTo,
                    is_current AS IsCurrent,
                    sort_order AS SortOrder,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt
                FROM experiences
                WHERE id = @Id;";

            using var connection = _dbHelper.CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Experience>(sql, new { Id = id });
        }

        public async Task<int> CreateAsync(Experience experience)
        {
            using var connection = _dbHelper.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();
            
            try 
            {
                if (experience.IsCurrent)
                {
                    await connection.ExecuteAsync("UPDATE experiences SET is_current = false;", transaction: transaction);
                }

                var sql = @"
                    INSERT INTO experiences (
                        role, company, location, duration, description, skills,
                        icon_name, icon_library, icon_color, gradient_from, gradient_to,
                        is_current, sort_order
                    )
                    VALUES (
                        @Role, @Company, @Location, @Duration, @Description, @Skills,
                        @IconName, @IconLibrary, @IconColor, @GradientFrom, @GradientTo,
                        @IsCurrent, @SortOrder
                    )
                    RETURNING id;";

                var id = await connection.ExecuteScalarAsync<int>(sql, experience, transaction: transaction);
                transaction.Commit();
                return id;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(Experience experience)
        {
            using var connection = _dbHelper.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();
            
            try 
            {
                if (experience.IsCurrent)
                {
                    await connection.ExecuteAsync("UPDATE experiences SET is_current = false;", transaction: transaction);
                }

                var sql = @"
                    UPDATE experiences SET 
                        role = @Role,
                        company = @Company,
                        location = @Location,
                        duration = @Duration,
                        description = @Description,
                        skills = @Skills,
                        icon_name = @IconName,
                        icon_library = @IconLibrary,
                        icon_color = @IconColor,
                        gradient_from = @GradientFrom,
                        gradient_to = @GradientTo,
                        is_current = @IsCurrent,
                        sort_order = @SortOrder,
                        updated_at = NOW()
                    WHERE id = @Id;";

                var rowsAffected = await connection.ExecuteAsync(sql, experience, transaction: transaction);
                transaction.Commit();
                return rowsAffected > 0;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM experiences WHERE id = @Id;";

            using var connection = _dbHelper.CreateConnection();
            var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
            return rowsAffected > 0;
        }

        public async Task<bool> ReorderAsync(IEnumerable<ExperienceSortItem> items)
        {
            var sql = "UPDATE experiences SET sort_order = @SortOrder WHERE id = @Id;";
            
            using var connection = _dbHelper.CreateConnection();
            connection.Open();
            using var transaction = connection.BeginTransaction();
            try
            {
                var rowsAffected = await connection.ExecuteAsync(sql, items, transaction);
                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
        }
    }
}
