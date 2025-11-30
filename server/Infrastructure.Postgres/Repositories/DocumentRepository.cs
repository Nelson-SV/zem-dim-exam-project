using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly AppDbContext _context;

    public DocumentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Document?> GetByIdAsync(Guid id)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Document?> GetByDocuSealSubmissionIdAsync(string submissionId)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(d => d.Docusealsubmissionid == submissionId);
    }

    public async Task AddAsync(Document document)
    {
        await _context.Documents.AddAsync(document);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Document document)
    {
        _context.Documents.Update(document);
        await _context.SaveChangesAsync();
    }
    public async Task<IEnumerable<Document>> GetAllWithProjectAsync()
    {
        return await _context.Documents
            .Include(d => d.Project)
            .ThenInclude(p => p.Client)
            .OrderByDescending(d => d.Createdat)
            .ToListAsync();
    }

    public async Task<Document?> GetByIdWithProjectAsync(Guid id)
    {
        return await _context.Documents
            .Include(d => d.Project)
            .ThenInclude(p => p.Client)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<Document>> GetAllAsync()
    {
        return await _context.Documents
            .Where(d => !d.Isdeleted)
            .OrderByDescending(d => d.Createdat)
            .ToListAsync();
    }

    public async Task<IEnumerable<Document>> GetUserDocumentsAsync(Guid userId)
    {
        return await _context.Documents
            .Include(d => d.Project)
            .Where(d => !d.Isdeleted
                && d.Project.Clientid == userId
                && (d.Isvisibletoclient == true || d.Isvisibletoclient == null))
            .OrderByDescending(d => d.Createdat)
            .ToListAsync();
    }
}