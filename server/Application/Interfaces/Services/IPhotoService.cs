using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IPhotoService
{
    /// <summary>
    /// Admin-only fetch (existing behaviour) – no ownership checks.
    /// </summary>
    Task<PaginationItemsResponse<PhotoDto>> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize);

    /// <summary>
    /// Client-facing fetch with access validation against the requesting user and optional role-based admin bypass.
    /// </summary>
    Task<PaginationItemsResponse<PhotoDto>> GetForClientAsync(Guid requesterId, string requesterRole, Guid projectId, Guid? milestoneId, int page, int pageSize);

    Task<PhotoDto> CreateAsync(Guid projectId, CreatePhotoDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy);
    Task<PhotoDto> UpdateAsync(Guid projectId, Guid photoId, UpdatePhotoDto dto, Guid performedBy);
    Task DeleteAsync(Guid projectId, Guid photoId, Guid performedBy);
}
