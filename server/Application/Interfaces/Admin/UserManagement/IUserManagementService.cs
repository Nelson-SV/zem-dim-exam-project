using Application.Models.Dtos.UserManagement;

namespace Application.Interfaces.Admin.UserManagement;

public interface IUserManagementService
{
    List<Core.Domain.Entities.User> GetAll();
    Core.Domain.Entities.User? GetUserById(string email);
    Task<RegisterResponseDto> RegisterUser(RegisterRequestDto dto);
    Task<UpdateResponseDto> UpdateUser(UpdateRequestDto request);
    bool DeleteUser(string userId);
}