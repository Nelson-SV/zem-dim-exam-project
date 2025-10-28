using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Admin.UserManagement;

public class UserManagementRepository(AppDbContext ctx) : IUserManagementRepository
{
    public List<User> GetAll()
    {
        return ctx.Users.ToList();
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
        ctx.Users.Update(user);
        await ctx.SaveChangesAsync();
        return user;
    }

    public bool DeleteUser(Guid userId)
    {
        var user = ctx.Users.Find(userId);
        ctx.Users.Remove(user);
        return ctx.SaveChanges() > 0;
    }
}