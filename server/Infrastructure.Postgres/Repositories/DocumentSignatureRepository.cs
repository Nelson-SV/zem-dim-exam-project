using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using System.Threading.Tasks;

namespace Infrastructure.Postgres.Repositories;

public class DocumentSignatureRepository : IDocumentSignatureRepository
{
    private readonly AppDbContext _context;

    public DocumentSignatureRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(DocumentSignature signature)
    {
        await _context.DocumentSignatures.AddAsync(signature);
        await _context.SaveChangesAsync();
    }
}