using Application.Models.Dtos.Profile;

namespace Application.Interfaces.Services;

public interface IProfileService
{
    Task<GetProfileResponseDto> GetProfile(Guid userId);
    Task<GetProfileResponseDto> UpdateProfile(Guid userId, UpdateProfileDto dto);
    Task ChangePassword(Guid userId, ChangePasswordDto dto);
}
