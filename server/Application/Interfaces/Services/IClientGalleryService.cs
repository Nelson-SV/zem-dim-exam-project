using Application.Models.Dtos.Common;
using Application.Models.Dtos.Photos;

namespace Application.Interfaces.Services;

public interface IClientGalleryService
{
    Task<IReadOnlyCollection<ClientGalleryProjectDto>> GetProjectsAsync(Guid clientId);
    Task<PaginationItemsResponse<ClientGalleryDto>> GetPhotosAsync(
        Guid clientId,
        Guid projectId,
        Guid? milestoneId,
        int page,
        int pageSize);
}