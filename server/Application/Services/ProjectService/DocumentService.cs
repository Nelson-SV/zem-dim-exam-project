using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.ProjectService;

public class DocumentService(
    IDocumentRepository repository,
    IProjectRepository projectRepository,
    IStorageService storage,
    IDbUnitOfWork unitOfWork,
    ILogger<DocumentService> logger) : IDocumentService
{
    private const long MaxDocumentSizeBytes = 25 * 1024 * 1024; // 25MB

    public async Task<PaginationItemsResponse<DocumentDto>> GetAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        await EnsureProjectExists(projectId);
        var (items, total) = await repository.GetAsync(projectId, page, pageSize, ct);

        return new PaginationItemsResponse<DocumentDto>
        {
            Items = DocumentDto.FromEntities(items),
            Page = page,
            PageSize = pageSize,
            TotalItems = total
        };
    }

    public async Task<DocumentDto> CreateAsync(Guid projectId, CreateDocumentDto dto, Stream fileStream, string fileName, string contentType, long fileSize, Guid uploadedBy, CancellationToken ct = default)
    {
        if (fileSize <= 0 || fileSize > MaxDocumentSizeBytes)
            throw new ApplicationException("Document file size exceeds the 25 MB limit.");

        await unitOfWork.BeginAsync();
        string fileUrl = string.Empty;
        try
        {
            await EnsureProjectExists(projectId);

            fileUrl = await storage.UploadDocumentAsync(fileStream, fileName, contentType, projectId, ct);

            var entity = new Document
            {
                Id = Guid.NewGuid(),
                Projectid = projectId,
                Title = dto.Title.Trim(),
                Filename = fileName,
                Fileurl = fileUrl,
                Filesize = fileSize,
                Mimetype = contentType,
                Documenttype = dto.DocumentType,
                Uploadedbyid = uploadedBy,
                Isvisibletoclient = dto.IsVisibleToClient,
                Createdat = DateTime.UtcNow
            };

            var saved = await repository.InsertAsync(entity, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Document {DocumentId} created for project {ProjectId} by {UserId}", saved.Id, projectId, uploadedBy);
            return DocumentDto.FromEntity(saved);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            if (!string.IsNullOrEmpty(fileUrl))
                await storage.DeleteFileAsync(fileUrl, ct);
            logger.LogError(ex, "Failed to create document for project {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<DocumentDto> UpdateAsync(Guid projectId, Guid documentId, UpdateDocumentDto dto, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var document = await repository.GetByIdAsync(documentId, ct) ?? throw new KeyNotFoundException("Document not found");
            if (document.Projectid != projectId)
                throw new UnauthorizedAccessException("Document does not belong to this project");

            if (!string.IsNullOrWhiteSpace(dto.Title))
                document.Title = dto.Title.Trim();

            if (!string.IsNullOrWhiteSpace(dto.DocumentType))
                document.Documenttype = dto.DocumentType.Trim();

            if (dto.IsVisibleToClient.HasValue)
                document.Isvisibletoclient = dto.IsVisibleToClient.Value;

            var updated = await repository.UpdateAsync(document, ct);
            await unitOfWork.CommitAsync();
            logger.LogInformation("Document {DocumentId} updated by {UserId}", documentId, performedBy);
            return DocumentDto.FromEntity(updated);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to update document {DocumentId}", documentId);
            throw;
        }
    }

    public async Task DeleteAsync(Guid projectId, Guid documentId, Guid performedBy, CancellationToken ct = default)
    {
        await unitOfWork.BeginAsync();
        try
        {
            var document = await repository.GetByIdAsync(documentId, ct) ?? throw new KeyNotFoundException("Document not found");
            if (document.Projectid != projectId)
                throw new UnauthorizedAccessException("Document does not belong to this project");

            await repository.DeleteAsync(documentId, ct);
            if (!string.IsNullOrEmpty(document.Fileurl))
                await storage.DeleteFileAsync(document.Fileurl, ct);

            await unitOfWork.CommitAsync();
            logger.LogInformation("Document {DocumentId} deleted by {UserId}", documentId, performedBy);
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackAsync();
            logger.LogError(ex, "Failed to delete document {DocumentId}", documentId);
            throw;
        }
    }

    private async Task EnsureProjectExists(Guid projectId)
    {
        var project = await projectRepository.GetByIdAsync(projectId);
        if (project == null || project.Isdeleted)
            throw new KeyNotFoundException("Project not found");
    }
}
