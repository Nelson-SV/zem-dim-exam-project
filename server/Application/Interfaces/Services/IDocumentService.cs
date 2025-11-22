using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IDocumentService
{
    Task<PaginationItemsResponse<DocumentDto>> GetAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<DocumentDto> CreateAsync(Guid projectId, CreateDocumentDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy, CancellationToken ct = default);
    Task<DocumentDto> UpdateAsync(Guid projectId, Guid documentId, UpdateDocumentDto dto, Guid performedBy, CancellationToken ct = default);
    Task DeleteAsync(Guid projectId, Guid documentId, Guid performedBy, CancellationToken ct = default);
}
