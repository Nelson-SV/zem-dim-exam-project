using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetUserProjectsAsync(Guid userId);
    Task<ProjectDto?> GetProjectByIdAsync(Guid projectId);
    Task<ProjectParticipantsDto> GetProjectParticipantsAsync(Guid projectId);
}