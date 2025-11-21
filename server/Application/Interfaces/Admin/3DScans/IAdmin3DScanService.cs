using Application.Models.Dtos._3DScans;
using Application.Models.Dtos.Common;

namespace Application.Interfaces.Admin._3DScans;

public interface IAdmin3DScanService
{
    Task<AdminThreeDScanDto> UploadAsync(UploadThreeDScanRequestDto.UploadThreeDScanCommand command, Guid uploadedBy, CancellationToken cancellationToken);
    Task<PaginationItemsResponse<AdminThreeDScanDto>> GetAsync(Guid? projectId, Guid? milestoneId, int page, int pageSize, CancellationToken cancellationToken);
    Task<AdminThreeDScanDto?> GetByIdAsync(Guid scanId, CancellationToken cancellationToken);
    Task DeleteAsync(Guid scanId, Guid performedBy, CancellationToken cancellationToken);
    Task<AdminThreeDScanDto> UpdateAsync(Guid scanId, UpdateThreeDScanRequestDto dto, Guid performedBy, CancellationToken ct);

}