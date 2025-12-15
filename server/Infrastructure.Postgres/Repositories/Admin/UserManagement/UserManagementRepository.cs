using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Models.Enums;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Admin.UserManagement;

public class UserManagementRepository(AppDbContext ctx) : IUserManagementRepository
{
    public List<User> GetAllUsers(
        int page, 
        int pageSize, 
        out int totalUsers, 
        string? search = null, 
        bool? showActiveOnly = true)
    {
        var query = ctx.Users
            .Include(u => u.Projects)
            .Where(u => u.Role == Roles.UserRole);

        if (string.IsNullOrWhiteSpace(search))
        {
            if (showActiveOnly.HasValue)
            {
                if (showActiveOnly.Value)
                    query = query.Where(u => u.Isdeleted == false);
                else
                    query = query.Where(u => u.Isdeleted == true);
            }
        }
        
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(search) ||
                u.Firstname.ToLower().Contains(search) ||
                u.Lastname.ToLower().Contains(search));
        }
        
        totalUsers = query.Count();
        
        return query
            .OrderBy(u => u.Firstname)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }

    public User? GetUserByEmailOrNull(string email)
    {
        return ctx.Users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
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