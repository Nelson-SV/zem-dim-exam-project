using Application.Models.Dtos._3DScans;
using Application.Models.Dtos.Common;

namespace Application.Interfaces.Admin._3DScans;

public interface IAdmin3DScanService
{
    Task<AdminThreeDScanDto> UploadAsync(UploadThreeDScanRequestDto.UploadThreeDScanCommand command, Guid uploadedBy);
    Task<PaginationItemsResponse<AdminThreeDScanDto>> GetAsync(Guid? projectId, Guid? milestoneId, int page, int pageSize);
    Task<AdminThreeDScanDto?> GetByIdAsync(Guid scanId);
    Task DeleteAsync(Guid scanId, Guid performedBy);
    Task<AdminThreeDScanDto> UpdateAsync(Guid scanId, UpdateThreeDScanRequestDto dto, Guid performedBy);

}