using Application.Models.Dtos.UserManagement;

namespace Application.Interfaces.UserService;

public interface IUserService
{
    List<Core.Domain.Entities.User> GetAll();
    Core.Domain.Entities.User? GetUserById(string email);
    UpdateUserResponseDto UpdateUser(UpdateUserDto user);
    bool DeleteUser(string userId);
}