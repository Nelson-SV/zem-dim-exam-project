using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IDocumentSignatureRepository
{
    Task AddAsync(DocumentSignature signature);
}