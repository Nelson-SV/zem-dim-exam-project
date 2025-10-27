using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories.Admin.UserManagement;

public class AdminUserManagementRepository(AppDbContext ctx) : IAdminUserManagementRepository
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

    public User AddUser(User user)
    {
        ctx.Users.Add(user);
        ctx.SaveChanges();
        return user;
    }

    public User UpdateUserEmail(User user)
    {
        var existingUser = ctx.Users.Find(user.Id);
        existingUser.Email = user.Email;
        ctx.Entry(existingUser).State = EntityState.Modified;
        ctx.SaveChanges();
        return existingUser;
    }

    public bool DeleteUser(Guid userId)
    {
        var user = ctx.Users.Find(userId);
        ctx.Users.Remove(user);
        return ctx.SaveChanges() > 0;
    }
}