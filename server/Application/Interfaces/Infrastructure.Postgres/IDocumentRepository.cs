using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IDocumentRepository
{
    Task<Document?> GetByIdAsync(Guid id);

    Task<Document?> GetByDocuSealSubmissionIdAsync(string submissionId);

    Task UpdateAsync(Document document);

    Task AddAsync(Document document);

    Task<IEnumerable<Document>> GetAllAsync();
}