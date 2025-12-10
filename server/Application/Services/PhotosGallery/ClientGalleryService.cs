using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Photos;

namespace Application.Services.PhotosGallery;

public class ClientGalleryService(
    IProjectRepository projectRepository,
    IMilestoneRepository milestoneRepository,
    IPhotoRepository photoRepository) : IClientGalleryService
{
    public async Task<IReadOnlyCollection<ClientGalleryProjectDto>> GetProjectsAsync(Guid clientId)
    {
        var projects = await projectRepository.GetByClientIdAsync(clientId);
        var result = new List<ClientGalleryProjectDto>(projects.Count);

        foreach (var project in projects)
        {
            var stages = await milestoneRepository.GetAllByProjectAsync(project.Id);
            result.Add(new ClientGalleryProjectDto(
                project.Id,
                project.Title,
                stages.Select(s => new ClientGalleryStageDto(s.Id, s.Title, s.Orderindex)).ToList()
            ));
        }

        return result;
    }

    public async Task<PaginationItemsResponse<ClientGalleryDto>> GetPhotosAsync(Guid clientId, Guid projectId, Guid? milestoneId, int page, int pageSize)
    {
        var project = await projectRepository.GetByIdAsync(projectId)
                      ?? throw new KeyNotFoundException("Project not found");

        if (project.Clientid != clientId || project.Isdeleted)
            throw new UnauthorizedAccessException("Project does not belong to this client");

        if (milestoneId.HasValue)
        {
            var belongs = await milestoneRepository.BelongsToProjectAsync(milestoneId.Value, projectId);
            if (!belongs) throw new ApplicationException("Milestone does not belong to project");
        }

        var (items, total) = await photoRepository.GetAsync(projectId, milestoneId, page, pageSize);

        return new PaginationItemsResponse<ClientGalleryDto>
        {
            Items = ClientGalleryDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }
}