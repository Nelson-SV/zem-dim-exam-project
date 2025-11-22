using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IPhotoService
{
    Task<PaginationItemsResponse<PhotoDto>> GetAsync(Guid projectId, Guid? milestoneId, int page, int pageSize, CancellationToken ct = default);
    Task<PhotoDto> CreateAsync(Guid projectId, CreatePhotoDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy, CancellationToken ct = default);
    Task<PhotoDto> UpdateAsync(Guid projectId, Guid photoId, UpdatePhotoDto dto, Guid performedBy, CancellationToken ct = default);
    Task DeleteAsync(Guid projectId, Guid photoId, Guid performedBy, CancellationToken ct = default);
}
