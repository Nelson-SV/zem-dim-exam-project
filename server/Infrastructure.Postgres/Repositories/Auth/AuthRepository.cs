using Application.Interfaces.Auth;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Auth;

public class AuthRepository(AppDbContext ctx) : IAuthRepository
{
    public async Task<bool> SavePasswordFromResetAsync(User user)
    {
        var existing = await ctx.Users.AsTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
        if (existing == null) throw new InvalidOperationException("User not found");

        ctx.Entry(existing).CurrentValues.SetValues(user);
        await ctx.SaveChangesAsync();
        return true;
    }
}