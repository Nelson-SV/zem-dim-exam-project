using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;

public interface IAdminUserManagementRepository
{
    List<User> GetAll();
    User? GetUserByEmailOrNull(string email);
    User? GetUserByIdOrNull(Guid id);
    User AddUser(User user);
    User UpdateUserEmail(User user);
    bool DeleteUser(Guid userId);
}