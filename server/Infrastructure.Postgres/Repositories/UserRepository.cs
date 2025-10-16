using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class UserRepository(AppDbContext ctx) : IUserRepository
{
    public List<User> GetAll()
    {
        return ctx.Users.ToList();
    }

    public User? GetUserByEmailOrNull(string email)
    {
        return ctx.Users.FirstOrDefault(u => u.Email == email);
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

    public bool DeleteUser(string userId)
    {
        var user = ctx.Users.Find(userId);
        ctx.Users.Remove(user);
        return ctx.SaveChanges() > 0;
    }
}