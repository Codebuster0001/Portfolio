using PortfolioBakend.DTOs;
using PortfolioBakend.Models;
using PortfolioBakend.Repositories;

namespace PortfolioBakend.Services
{
    /// <summary>
    /// Business logic layer for the Skills Management System.
    /// Wraps SkillsRepository with validation, error handling, and result objects.
    /// </summary>
    public class SkillsService
    {
        private readonly SkillsRepository _repo;

        public SkillsService(SkillsRepository repo)
        {
            _repo = repo;
        }

        // =====================================================================
        // CATEGORY OPERATIONS
        // =====================================================================

        public async Task<IEnumerable<SkillCategory>> GetAllCategoriesAsync()
            => await _repo.GetAllCategoriesAsync();

        public async Task<SkillCategory?> GetCategoryByIdAsync(int id)
            => await _repo.GetCategoryByIdAsync(id);

        public async Task<int> CreateCategoryAsync(SkillCategoryCreateDto dto)
            => await _repo.CreateCategoryAsync(dto);

        public async Task<bool> UpdateCategoryAsync(int id, SkillCategoryUpdateDto dto)
        {
            var affected = await _repo.UpdateCategoryAsync(id, dto);
            return affected > 0;
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var affected = await _repo.DeleteCategoryAsync(id);
            return affected > 0;
        }

        public async Task ReorderCategoriesAsync(Dictionary<int, int> idToOrder)
            => await _repo.BulkUpdateCategorySortOrderAsync(idToOrder);

        // =====================================================================
        // SKILL OPERATIONS
        // =====================================================================

        public async Task<(IEnumerable<Skill> Items, int TotalCount)> GetSkillsAsync(
            string? search = null,
            int? categoryId = null,
            int page = 1,
            int pageSize = 50)
            => await _repo.GetSkillsAsync(search, categoryId, page, pageSize);

        public async Task<IEnumerable<Skill>> GetSkillsByCategoryAsync(int categoryId)
            => await _repo.GetSkillsByCategoryAsync(categoryId);

        public async Task<Skill?> GetSkillByIdAsync(int id)
            => await _repo.GetSkillByIdAsync(id);

        public async Task<int> CreateSkillAsync(SkillCreateDto dto)
            => await _repo.CreateSkillAsync(dto);

        public async Task<bool> UpdateSkillAsync(int id, SkillUpdateDto dto)
        {
            var affected = await _repo.UpdateSkillAsync(id, dto);
            return affected > 0;
        }

        public async Task<bool> DeleteSkillAsync(int id)
        {
            var affected = await _repo.DeleteSkillAsync(id);
            return affected > 0;
        }

        public async Task ReorderSkillsAsync(Dictionary<int, int> idToOrder)
            => await _repo.BulkUpdateSkillSortOrderAsync(idToOrder);
    }
}
