using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class UpdateRepository(AppDbContext context) : IUpdateRepository
{
    public async Task<(IReadOnlyCollection<Update> Items, int Total)> GetUpdatesAsync(
        int page,
        int pageSize,
        Guid? projectId,
        string? updateType,
        string? search)
    {
        var query = context.Updates
            .Include(u => u.Project)
            .Include(u => u.Milestone)
            .Include(u => u.Createdby)
            .AsQueryable();

        if (projectId.HasValue)
        {
            query = query.Where(u => u.Projectid == projectId.Value);
        }

        if (!string.IsNullOrWhiteSpace(updateType))
        {
            var normalizedUpdateType = updateType.Trim().ToLower();
            query = query.Where(u => u.Updatetype.ToLower() == normalizedUpdateType);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(u =>
                u.Title.ToLower().Contains(normalizedSearch) ||
                (u.Description != null && u.Description.ToLower().Contains(normalizedSearch)));
        }

        query = query.OrderByDescending(u => u.Createdat ?? DateTime.MinValue);

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }
}
