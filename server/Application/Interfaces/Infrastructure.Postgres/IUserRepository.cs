using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserRepository
{
    List<User> GetAll();
    User? GetUserByEmailOrNull(string email);
    User AddUser(User user);
    User UpdateUserEmail(User user);
    bool DeleteUser(string userId);
}