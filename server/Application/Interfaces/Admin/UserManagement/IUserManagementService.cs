using Application.Models.Dtos.UserManagement;
using Core.Domain.Entities;

namespace Application.Interfaces.Admin.UserManagement;

public interface IUserManagementService
{
    Task<UsersDetailsDto> RegisterUser(RegisterRequestDto dto);
    Task<UsersDetailsDto> UpdateUser(UpdateRequestDto request);
    Task<DeleteResponseDto> SoftDelete(string userId);
    Task<GetAllUsersResponseDto> GetAllUsers(int page, int pageSize, string? search, bool? filterIsActive);
}