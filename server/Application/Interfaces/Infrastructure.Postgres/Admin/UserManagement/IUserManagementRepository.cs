using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;

public interface IUserManagementRepository
{
    List<User> GetAllUsers(int page, int pageSize, out int totalUsers, string? search);
    User? GetUserByEmailOrNull(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<User> AddUser(User user);
    Task<User> UpdateUser(User user);
    Task<bool> SoftDelete(Guid userId);
}