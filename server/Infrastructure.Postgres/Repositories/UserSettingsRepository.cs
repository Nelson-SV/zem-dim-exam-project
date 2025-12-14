using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class UserSettingsRepository(AppDbContext ctx) : IUserSettingsRepository
{
    public async Task<Usersetting?> GetByUserId(Guid userId)
    {
        return await ctx.Usersettings.FirstOrDefaultAsync(s => s.Userid == userId);
    }

    public async Task<Usersetting> Create(Usersetting settings)
    {
        ctx.Usersettings.Add(settings);
        await ctx.SaveChangesAsync();
        return settings;
    }

    public async Task<Usersetting> Update(Usersetting settings)
    {
        var existing = await ctx.Usersettings.AsTracking().FirstOrDefaultAsync(s => s.Id == settings.Id);
        if (existing == null)
            throw new InvalidOperationException("User settings not found");

        ctx.Entry(existing).CurrentValues.SetValues(settings);
        await ctx.SaveChangesAsync();
        return existing;
    }
}
