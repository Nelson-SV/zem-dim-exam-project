using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;

public interface IUserManagementRepository
{
    List<User> GetAll();
    User? GetUserByEmailOrNull(string email);
    User? GetUserByIdOrNull(Guid id);
    Task<User> AddUser(User user);
    Task<User> UpdateUser(User user);
    bool DeleteUser(Guid userId);
}