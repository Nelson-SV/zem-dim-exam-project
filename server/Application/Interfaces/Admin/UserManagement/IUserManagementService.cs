using Application.Models.Dtos.UserManagement;

namespace Application.Interfaces.Admin.UserManagement;

public interface IUserManagementService
{
    List<Core.Domain.Entities.User> GetAll();
    Core.Domain.Entities.User? GetUserById(string email);
    public Task<RegisterResponseDto> RegisterUser(RegisterRequestDto dto);
    UpdateResponseDto UpdateUser(UpdateRequestDto request);
    bool DeleteUser(string userId);
}