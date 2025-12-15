using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;

namespace Application.Interfaces.Services;

public interface IDocumentService
{
    Task<PaginationItemsResponse<DocumentDto>> GetAsync(Guid projectId, int page, int pageSize);
    Task<DocumentDto> CreateAsync(Guid projectId, CreateDocumentDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy);
    Task<DocumentDto> UpdateAsync(Guid projectId, Guid documentId, UpdateDocumentDto dto, Guid performedBy);
    Task DeleteAsync(Guid projectId, Guid documentId, Guid performedBy);
}
