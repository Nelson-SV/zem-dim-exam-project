using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserRepository
{
    List<User> GetAll();
    User? GetUserByEmailOrNull(string email);
    Task<User?> GetByIdAsync(Guid id);
    User AddUser(User user);
    User UpdateUserEmail(User user);
    bool DeleteUser(string userId);
}