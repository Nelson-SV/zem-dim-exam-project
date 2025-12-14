using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Application.Models.Dtos.Profile;

namespace Application.Services.Profile;

public class ProfileService(
    IUserManagementRepository userRepository,
    ISecurityService securityService) : IProfileService
{
    public async Task<GetProfileResponseDto> GetProfile(Guid userId)
    {
        var user = await userRepository.GetByIdAsync(userId)
                   ?? throw new ValidationException("User not found");

        return GetProfileResponseDto.FromEntity(user);
    }

    public async Task<GetProfileResponseDto> UpdateProfile(Guid userId, UpdateProfileDto dto)
    {
        var user = await userRepository.GetByIdAsync(userId)
                   ?? throw new ValidationException("User not found");

        // Check email uniqueness (excluding current user)
        if (user.Email != dto.Email)
        {
            var existingUser = userRepository.GetUserByEmailOrNull(dto.Email);
            if (existingUser != null && existingUser.Id != userId)
            {
                throw new ValidationException("Email is already in use");
            }
        }

        // Update user properties
        user.Firstname = dto.FirstName;
        user.Lastname = dto.LastName;
        user.Email = dto.Email;
        user.Phonenumber = dto.PhoneNumber;
        user.Updatedat = DateTime.UtcNow;

        var updatedUser = await userRepository.UpdateUser(user);
        return GetProfileResponseDto.FromEntity(updatedUser);
    }

    public async Task ChangePassword(Guid userId, ChangePasswordDto dto)
    {
        var user = await userRepository.GetByIdAsync(userId)
                   ?? throw new ValidationException("User not found");

        // Verify current password
        try
        {
            securityService.VerifyPasswordOrThrow(dto.CurrentPassword + user.Salt, user.Passwordhash);
        }
        catch
        {
            throw new ValidationException("Current password is incorrect");
        }

        // Generate new salt and hash
        var newSalt = securityService.GenerateSalt();
        var newHash = securityService.HashPassword(dto.NewPassword + newSalt);

        // Update password
        user.Salt = newSalt;
        user.Passwordhash = newHash;
        user.Updatedat = DateTime.UtcNow;

        await userRepository.UpdateUser(user);
    }
}
