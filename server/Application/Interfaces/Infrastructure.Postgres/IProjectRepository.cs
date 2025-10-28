using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IProjectRepository
{
    Task<List<Project>> GetAllAsync();
    Task<List<Project>> GetByClientIdAsync(Guid clientId);
    Task<Project?> GetByIdAsync(Guid projectId);
}