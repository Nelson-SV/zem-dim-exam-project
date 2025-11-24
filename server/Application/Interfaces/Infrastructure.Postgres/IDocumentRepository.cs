using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IDocumentRepository
{
    Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct = default);
    Task<(IReadOnlyCollection<Document> Items, int Total)> GetAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default);
    Task<Document?> GetByIdAsync(Guid documentId, CancellationToken ct = default);
    Task<Document> InsertAsync(Document document, CancellationToken ct = default);
    Task<Document> UpdateAsync(Document document, CancellationToken ct = default);
    Task SoftDeleteAsync(Guid documentId, CancellationToken ct = default);
}
