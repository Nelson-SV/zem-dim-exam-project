using Application.Interfaces.Infrastructure.Postgres.Users._3DScans;
using Application.Models.Dtos._3DScans;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Users._3DScans;

public class User3DScanRepository(AppDbContext ctx) : IUser3DScanRepository
{
    public async Task<List<Project>> GetScansByClientIdAsync(Guid clientId)
    {
        return await ctx.Projects
            .Include(p => p.Threedscans)
            .Where(p => p.Clientid == clientId)
            .OrderByDescending(p => p.Progresspercentage)
            .ToListAsync();
    }
}