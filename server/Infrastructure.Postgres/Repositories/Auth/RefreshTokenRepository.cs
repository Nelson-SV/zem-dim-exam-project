using Application.Interfaces.Auth;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Auth;

public class RefreshTokenRepository(AppDbContext ctx) : IRefreshTokenRepository
{
    public async Task AddAsync(Guid userId, string tokenHash, DateTimeOffset expiresAt)
    {
        var entity = new Refreshtoken
        {
            Id = Guid.NewGuid(),
            Userid = userId,
            Token = tokenHash,
            Expiresat = expiresAt.UtcDateTime,
            Createdat = DateTime.UtcNow,
            Isrevoked = false
        };

        ctx.Refreshtokens.Add(entity);
        await ctx.SaveChangesAsync();
    }

    public async Task<Refreshtoken?> GetActiveByHashAsync(string tokenHash)
    {
        return await ctx.Refreshtokens.FirstOrDefaultAsync(t =>
            t.Token == tokenHash &&
            (t.Isrevoked == null || t.Isrevoked == false) &&
            t.Expiresat > DateTime.UtcNow);
    }

    public async Task RevokeAllForUserAsync(Guid userId, DateTimeOffset revokedAt)
    {
        var tokens = await ctx.Refreshtokens
            .Where(t => t.Userid == userId && (t.Isrevoked == null || t.Isrevoked == false))
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.Isrevoked = true;
            token.Revokedat = revokedAt.UtcDateTime;
        }

        await ctx.SaveChangesAsync();
    }
}
