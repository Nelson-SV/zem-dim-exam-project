using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Admin.UserManagement;

public class UserManagementRepository(AppDbContext ctx) : IUserManagementRepository
{
    public List<User> GetAll()
    {
        return ctx.Users
            .Include(c => c.Projects)
            .ToList();
    }

    public User? GetUserByEmailOrNull(string email)
    {
        return ctx.Users.FirstOrDefault(u => u.Email == email);
    }
    
    public User? GetUserByIdOrNull(Guid id)
    {
        return ctx.Users.FirstOrDefault(u => u.Id == id);
    }
    
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await ctx.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User> AddUser(User user)
    {
        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateUser(User user)
    {
        /*
        ctx.Users.Update(user);
        await ctx.SaveChangesAsync();
        return user;
        */
        var existing = await ctx.Users.AsTracking().FirstOrDefaultAsync(u => u.Id == user.Id);
        if (existing == null) throw new InvalidOperationException("User not found");

        ctx.Entry(existing).CurrentValues.SetValues(user);
        await ctx.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> SoftDelete(Guid userId)
    {
        var user = await ctx.Users.FindAsync(userId);
        if (user == null) return false;

        user.Isdeleted = true;
        user.Isactive = false;
        user.Updatedat = DateTime.Now;

        await ctx.SaveChangesAsync();
        return true;
    }
}