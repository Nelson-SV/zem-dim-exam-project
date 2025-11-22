using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class DocumentRepository(AppDbContext ctx) : IDocumentRepository
{
    public Task<bool> ProjectExistsAsync(Guid projectId, CancellationToken ct = default) =>
        ctx.Projects.AnyAsync(p => p.Id == projectId && !p.Isdeleted, ct);

    public async Task<(IReadOnlyCollection<Document> Items, int Total)> GetAsync(Guid projectId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = ctx.Documents
            .Include(d => d.Project)
            .Include(d => d.Uploadedby)
            .Where(d => d.Projectid == projectId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(d => d.Createdat)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, total);
    }

    public Task<Document?> GetByIdAsync(Guid documentId, CancellationToken ct = default) =>
        ctx.Documents
            .Include(d => d.Project)
            .Include(d => d.Uploadedby)
            .FirstOrDefaultAsync(d => d.Id == documentId, ct);

    public async Task<Document> InsertAsync(Document document, CancellationToken ct = default)
    {
        ctx.Documents.Add(document);
        await ctx.SaveChangesAsync(ct);
        return document;
    }

    public async Task<Document> UpdateAsync(Document document, CancellationToken ct = default)
    {
        ctx.Documents.Update(document);
        await ctx.SaveChangesAsync(ct);
        await ctx.Entry(document).Reference(d => d.Project).LoadAsync(ct);
        await ctx.Entry(document).Reference(d => d.Uploadedby).LoadAsync(ct);
        return document;
    }

    public async Task DeleteAsync(Guid documentId, CancellationToken ct = default)
    {
        var entity = await ctx.Documents.FindAsync(new object[] { documentId }, ct)
                     ?? throw new KeyNotFoundException("Document not found");

        ctx.Documents.Remove(entity);
        await ctx.SaveChangesAsync(ct);
    }
}
