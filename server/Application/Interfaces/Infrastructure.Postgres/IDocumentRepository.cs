using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IDocumentRepository
{
    Task<Document?> GetByIdAsync(Guid id);

     Task<IEnumerable<Document>> GetAllWithProjectAsync();
    Task<Document?> GetByIdWithProjectAsync(Guid id);

    Task UpdateAsync(Document document);

    Task AddAsync(Document document);

    Task<IEnumerable<Document>> GetAllAsync();

    Task<IEnumerable<Document>> GetUserDocumentsAsync(Guid userId);
}