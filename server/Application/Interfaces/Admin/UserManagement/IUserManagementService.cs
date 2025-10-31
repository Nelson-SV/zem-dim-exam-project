using Application.Models.Dtos.UserManagement;
using Core.Domain.Entities;

namespace Application.Interfaces.Admin.UserManagement;

public interface IUserManagementService
{
    User? GetUserById(string email);
    Task<UsersDetailsDto> RegisterUser(RegisterRequestDto dto);
    Task<UpdateResponseDto> UpdateUser(UpdateRequestDto request);
    Task<DeleteResponseDto> SoftDelete(string userId);
    Task<GetAllUsersResponseDto> GetAllUsers();
}