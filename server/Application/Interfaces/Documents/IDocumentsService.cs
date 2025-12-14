using Application.Models.Dtos.Documents;

namespace Application.Interfaces.Documents;

public interface IDocumentsService
{
    Task<IEnumerable<DocumentDto>> GetAllAsync(Guid userId, string role);
    Task<DocumentDto?> GetByIdAsync(Guid id);

    Task<DocumentDto> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid projectId,
        string title,
        Guid uploadedById,
        bool isVisibleToClient = false,
        bool requiresSignature = false);

    Task<DocumentDto> UploadDocumentForClientAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid projectId,
        string? title,
        bool requiresSignature,
        Guid uploadedById);

    Task<string> SignDocumentAsync(
        Guid documentId,
        string signatureBase64,
        double positionX,
        double positionY,
        double width,
        double height,
        int pageNumber,
        Guid userId,
        string userRole,
        string? ipAddress);

    Task UpdateAsync(Guid id, UpdateDocumentRequest request);
    Task DeleteAsync(Guid id);
}