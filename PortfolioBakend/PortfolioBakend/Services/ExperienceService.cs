using System.Collections.Generic;
using System.Threading.Tasks;
using PortfolioBakend.DTOs;
using PortfolioBakend.Models;
using PortfolioBakend.Repositories;

namespace PortfolioBakend.Services
{
    public interface IExperienceService
    {
        Task<IEnumerable<Experience>> GetAllExperiencesAsync();
        Task<Experience?> GetExperienceByIdAsync(int id);
        Task<Experience> CreateExperienceAsync(ExperienceCreateDto dto);
        Task<bool> UpdateExperienceAsync(int id, ExperienceUpdateDto dto);
        Task<bool> DeleteExperienceAsync(int id);
        Task<bool> ReorderExperiencesAsync(IEnumerable<ExperienceSortItem> items);
    }

    public class ExperienceService : IExperienceService
    {
        private readonly IExperienceRepository _repository;

        public ExperienceService(IExperienceRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Experience>> GetAllExperiencesAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Experience?> GetExperienceByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Experience> CreateExperienceAsync(ExperienceCreateDto dto)
        {
            var experience = new Experience
            {
                Role = dto.Role,
                Company = dto.Company,
                Location = dto.Location,
                Duration = dto.Duration,
                Description = dto.Description,
                Skills = dto.Skills,
                IconName = dto.IconName,
                IconLibrary = dto.IconLibrary,
                IconColor = dto.IconColor,
                GradientFrom = dto.GradientFrom,
                GradientTo = dto.GradientTo,
                IsCurrent = dto.IsCurrent,
                SortOrder = dto.SortOrder
            };

            var newId = await _repository.CreateAsync(experience);
            experience.Id = newId;
            return experience;
        }

        public async Task<bool> UpdateExperienceAsync(int id, ExperienceUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Role = dto.Role;
            existing.Company = dto.Company;
            existing.Location = dto.Location;
            existing.Duration = dto.Duration;
            existing.Description = dto.Description;
            existing.Skills = dto.Skills;
            existing.IconName = dto.IconName;
            existing.IconLibrary = dto.IconLibrary;
            existing.IconColor = dto.IconColor;
            existing.GradientFrom = dto.GradientFrom;
            existing.GradientTo = dto.GradientTo;
            existing.IsCurrent = dto.IsCurrent;
            existing.SortOrder = dto.SortOrder;

            return await _repository.UpdateAsync(existing);
        }

        public async Task<bool> DeleteExperienceAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<bool> ReorderExperiencesAsync(IEnumerable<ExperienceSortItem> items)
        {
            return await _repository.ReorderAsync(items);
        }
    }
}
