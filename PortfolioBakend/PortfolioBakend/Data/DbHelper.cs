using Npgsql;
using System.Data;

namespace PortfolioBakend.Data
{
    public class DbHelper
    {
        private readonly string _connectionString;

        public DbHelper(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new Exception("Connection string missing");
        }

        // ✅ Create connection (for Dapper / manual use)
        public IDbConnection CreateConnection()
        {
            return new NpgsqlConnection(_connectionString);
        }

        // ✅ Common method to create command safely
        private NpgsqlCommand CreateCommand(NpgsqlConnection conn, string query, NpgsqlParameter[] parameters)
        {
            var cmd = new NpgsqlCommand(query, conn)
            {
                CommandType = CommandType.Text,
                CommandTimeout = 30 // ⏱️ prevent hanging queries
            };

            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    // 🔐 Ensure null handling (important for PostgreSQL)
                    param.Value = param.Value ?? DBNull.Value;
                    cmd.Parameters.Add(param);
                }
            }

            return cmd;
        }

        // ✅ SELECT → DataTable
        public async Task<DataTable> ExecuteQueryAsync(string query, NpgsqlParameter[] parameters = null)
        {
            var dt = new DataTable();

            await using var conn = new NpgsqlConnection(_connectionString);
            try
            {
                await conn.OpenAsync();

                await using var cmd = CreateCommand(conn, query, parameters);
                await using var reader = await cmd.ExecuteReaderAsync();

                dt.Load(reader);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DB ERROR (SELECT): {ex.Message}");
                throw;
            }

            return dt;
        }

        // ✅ INSERT / UPDATE / DELETE
        public async Task<int> ExecuteNonQueryAsync(string query, NpgsqlParameter[] parameters = null)
        {
            await using var conn = new NpgsqlConnection(_connectionString);

            try
            {
                await conn.OpenAsync();

                await using var cmd = CreateCommand(conn, query, parameters);
                return await cmd.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DB ERROR (NON-QUERY): {ex.Message}");
                throw;
            }
        }

        // ✅ SCALAR (COUNT, ID, etc.)
        public async Task<T> ExecuteScalarAsync<T>(string query, NpgsqlParameter[] parameters = null)
        {
            await using var conn = new NpgsqlConnection(_connectionString);

            try
            {
                await conn.OpenAsync();

                await using var cmd = CreateCommand(conn, query, parameters);
                var result = await cmd.ExecuteScalarAsync();

                if (result == null || result == DBNull.Value)
                    return default;

                return (T)Convert.ChangeType(result, typeof(T));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DB ERROR (SCALAR): {ex.Message}");
                throw;
            }
        }
    }
}