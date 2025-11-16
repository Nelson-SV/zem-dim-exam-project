using Application.Interfaces.Infrastructure.Postgres.Users._3DScans;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Users._3DScans;

public class User3DScanRepository(AppDbContext ctx) : IUser3DScanRepository
{
    public async Task<List<Threedscan>> GetScansByClientIdAsync(Guid clientId)
    {
        return await ctx.Threedscans
            .Include(s => s.Project)
            .ThenInclude(p => p.Client)
            .Where(s => s.Project.Clientid == clientId)
            .OrderByDescending(s => s.Scannedat)
            .ToListAsync();
    }
}