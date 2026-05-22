using Dapper;
using PortfolioBakend.Data;
using PortfolioBakend.DTOs;
using PortfolioBakend.Models;

namespace PortfolioBakend.Repositories
{
    /// <summary>
    /// Production-level repository for skill categories and skills.
    /// Uses Dapper + async/await with parameterized queries.
    /// </summary>
    public class SkillsRepository
    {
        private readonly DbHelper _db;

        public SkillsRepository(DbHelper db)
        {
            _db = db;
        }

        // =====================================================================
        // SKILL CATEGORIES
        // =====================================================================

        /// <summary>
        /// Returns all skill categories ordered by sort_order, each with their skills.
        /// </summary>
        public async Task<IEnumerable<SkillCategory>> GetAllCategoriesAsync()
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                SELECT
                    sc.id          AS Id,
                    sc.title       AS Title,
                    sc.description AS Description,
                    sc.icon_name   AS IconName,
                    sc.icon_library AS IconLibrary,
                    sc.gradient_from AS GradientFrom,
                    sc.gradient_to   AS GradientTo,
                    sc.sort_order  AS SortOrder,
                    sc.created_at  AS CreatedAt,
                    s.id           AS Id,
                    s.category_id  AS CategoryId,
                    s.skill_name   AS SkillName,
                    s.icon_name    AS IconName,
                    s.icon_library AS IconLibrary,
                    s.icon_color   AS IconColor,
                    s.bg_color     AS BgColor,
                    s.border_color AS BorderColor,
                    s.proficiency  AS Proficiency,
                    s.sort_order   AS SortOrder,
                    s.created_at   AS CreatedAt
                FROM skill_categories sc
                LEFT JOIN skills s ON s.category_id = sc.id
                ORDER BY sc.sort_order ASC, s.sort_order ASC";

            var categoryDict = new Dictionary<int, SkillCategory>();

            await conn.QueryAsync<SkillCategory, Skill, SkillCategory>(
                sql,
                (category, skill) =>
                {
                    if (!categoryDict.TryGetValue(category.Id, out var existingCategory))
                    {
                        existingCategory = category;
                        categoryDict[category.Id] = existingCategory;
                    }

                    if (skill != null && skill.Id > 0)
                        existingCategory.Skills.Add(skill);

                    return existingCategory;
                },
                splitOn: "Id"
            );

            return categoryDict.Values;
        }

        /// <summary>Returns a single category by id (without skills).</summary>
        public async Task<SkillCategory?> GetCategoryByIdAsync(int id)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                SELECT id AS Id, title AS Title, description AS Description,
                       icon_name AS IconName, icon_library AS IconLibrary,
                       gradient_from AS GradientFrom, gradient_to AS GradientTo,
                       sort_order AS SortOrder, created_at AS CreatedAt
                FROM skill_categories
                WHERE id = @Id";

            return await conn.QueryFirstOrDefaultAsync<SkillCategory>(sql, new { Id = id });
        }

        /// <summary>Inserts a new skill category and returns the new id.</summary>
        public async Task<int> CreateCategoryAsync(SkillCategoryCreateDto dto)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                INSERT INTO skill_categories
                    (title, description, icon_name, icon_library, gradient_from, gradient_to, sort_order)
                VALUES
                    (@Title, @Description, @IconName, @IconLibrary, @GradientFrom, @GradientTo, @SortOrder)
                RETURNING id";

            return await conn.ExecuteScalarAsync<int>(sql, new
            {
                dto.Title,
                dto.Description,
                dto.IconName,
                dto.IconLibrary,
                dto.GradientFrom,
                dto.GradientTo,
                dto.SortOrder
            });
        }

        /// <summary>Updates an existing skill category. Returns rows affected.</summary>
        public async Task<int> UpdateCategoryAsync(int id, SkillCategoryUpdateDto dto)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                UPDATE skill_categories SET
                    title         = @Title,
                    description   = @Description,
                    icon_name     = @IconName,
                    icon_library  = @IconLibrary,
                    gradient_from = @GradientFrom,
                    gradient_to   = @GradientTo,
                    sort_order    = @SortOrder
                WHERE id = @Id";

            return await conn.ExecuteAsync(sql, new
            {
                dto.Title,
                dto.Description,
                dto.IconName,
                dto.IconLibrary,
                dto.GradientFrom,
                dto.GradientTo,
                dto.SortOrder,
                Id = id
            });
        }

        /// <summary>Deletes a category. Skills are cascade deleted by FK.</summary>
        public async Task<int> DeleteCategoryAsync(int id)
        {
            using var conn = _db.CreateConnection();
            return await conn.ExecuteAsync("DELETE FROM skill_categories WHERE id = @Id", new { Id = id });
        }

        // =====================================================================
        // SKILLS
        // =====================================================================

        /// <summary>
        /// Returns skills with optional search, category filter, and pagination.
        /// </summary>
        public async Task<(IEnumerable<Skill> Items, int TotalCount)> GetSkillsAsync(
            string? search = null,
            int? categoryId = null,
            int page = 1,
            int pageSize = 50)
        {
            using var conn = _db.CreateConnection();

            var whereClauses = new List<string>();
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(search))
            {
                whereClauses.Add("LOWER(skill_name) LIKE LOWER(@Search)");
                parameters.Add("Search", $"%{search}%");
            }

            if (categoryId.HasValue)
            {
                whereClauses.Add("category_id = @CategoryId");
                parameters.Add("CategoryId", categoryId.Value);
            }

            var where = whereClauses.Count > 0
                ? "WHERE " + string.Join(" AND ", whereClauses)
                : string.Empty;

            var countSql = $"SELECT COUNT(*) FROM skills {where}";
            var totalCount = await conn.ExecuteScalarAsync<int>(countSql, parameters);

            parameters.Add("Offset", (page - 1) * pageSize);
            parameters.Add("PageSize", pageSize);

            var dataSql = $@"
                SELECT
                    id AS Id, category_id AS CategoryId, skill_name AS SkillName,
                    icon_name AS IconName, icon_library AS IconLibrary,
                    icon_color AS IconColor, bg_color AS BgColor, border_color AS BorderColor,
                    proficiency AS Proficiency, sort_order AS SortOrder, created_at AS CreatedAt
                FROM skills
                {where}
                ORDER BY sort_order ASC, created_at DESC
                LIMIT @PageSize OFFSET @Offset";

            var items = await conn.QueryAsync<Skill>(dataSql, parameters);
            return (items, totalCount);
        }

        /// <summary>Returns all skills for a specific category, ordered by sort_order.</summary>
        public async Task<IEnumerable<Skill>> GetSkillsByCategoryAsync(int categoryId)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                SELECT
                    id AS Id, category_id AS CategoryId, skill_name AS SkillName,
                    icon_name AS IconName, icon_library AS IconLibrary,
                    icon_color AS IconColor, bg_color AS BgColor, border_color AS BorderColor,
                    proficiency AS Proficiency, sort_order AS SortOrder, created_at AS CreatedAt
                FROM skills
                WHERE category_id = @CategoryId
                ORDER BY sort_order ASC";

            return await conn.QueryAsync<Skill>(sql, new { CategoryId = categoryId });
        }

        /// <summary>Returns a single skill by id.</summary>
        public async Task<Skill?> GetSkillByIdAsync(int id)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                SELECT
                    id AS Id, category_id AS CategoryId, skill_name AS SkillName,
                    icon_name AS IconName, icon_library AS IconLibrary,
                    icon_color AS IconColor, bg_color AS BgColor, border_color AS BorderColor,
                    proficiency AS Proficiency, sort_order AS SortOrder, created_at AS CreatedAt
                FROM skills
                WHERE id = @Id";

            return await conn.QueryFirstOrDefaultAsync<Skill>(sql, new { Id = id });
        }

        /// <summary>Inserts a new skill and returns the new id.</summary>
        public async Task<int> CreateSkillAsync(SkillCreateDto dto)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                INSERT INTO skills
                    (category_id, skill_name, icon_name, icon_library,
                     icon_color, bg_color, border_color, proficiency, sort_order)
                VALUES
                    (@CategoryId, @SkillName, @IconName, @IconLibrary,
                     @IconColor, @BgColor, @BorderColor, @Proficiency, @SortOrder)
                RETURNING id";

            return await conn.ExecuteScalarAsync<int>(sql, new
            {
                dto.CategoryId,
                dto.SkillName,
                dto.IconName,
                dto.IconLibrary,
                dto.IconColor,
                dto.BgColor,
                dto.BorderColor,
                dto.Proficiency,
                dto.SortOrder
            });
        }

        /// <summary>Updates an existing skill. Returns rows affected.</summary>
        public async Task<int> UpdateSkillAsync(int id, SkillUpdateDto dto)
        {
            using var conn = _db.CreateConnection();

            const string sql = @"
                UPDATE skills SET
                    category_id  = @CategoryId,
                    skill_name   = @SkillName,
                    icon_name    = @IconName,
                    icon_library = @IconLibrary,
                    icon_color   = @IconColor,
                    bg_color     = @BgColor,
                    border_color = @BorderColor,
                    proficiency  = @Proficiency,
                    sort_order   = @SortOrder
                WHERE id = @Id";

            return await conn.ExecuteAsync(sql, new
            {
                dto.CategoryId,
                dto.SkillName,
                dto.IconName,
                dto.IconLibrary,
                dto.IconColor,
                dto.BgColor,
                dto.BorderColor,
                dto.Proficiency,
                dto.SortOrder,
                Id = id
            });
        }

        /// <summary>Deletes a skill by id.</summary>
        public async Task<int> DeleteSkillAsync(int id)
        {
            using var conn = _db.CreateConnection();
            return await conn.ExecuteAsync("DELETE FROM skills WHERE id = @Id", new { Id = id });
        }

        /// <summary>
        /// Bulk update sort_order for skills (used by drag-and-drop reordering).
        /// Accepts a dictionary of id → new sort_order.
        /// </summary>
        public async Task BulkUpdateSkillSortOrderAsync(Dictionary<int, int> idToOrder)
        {
            using var conn = _db.CreateConnection();

            foreach (var (id, order) in idToOrder)
            {
                await conn.ExecuteAsync(
                    "UPDATE skills SET sort_order = @Order WHERE id = @Id",
                    new { Order = order, Id = id }
                );
            }
        }

        /// <summary>
        /// Bulk update sort_order for categories (used by drag-and-drop reordering).
        /// </summary>
        public async Task BulkUpdateCategorySortOrderAsync(Dictionary<int, int> idToOrder)
        {
            using var conn = _db.CreateConnection();

            foreach (var (id, order) in idToOrder)
            {
                await conn.ExecuteAsync(
                    "UPDATE skill_categories SET sort_order = @Order WHERE id = @Id",
                    new { Order = order, Id = id }
                );
            }
        }
    }
}
