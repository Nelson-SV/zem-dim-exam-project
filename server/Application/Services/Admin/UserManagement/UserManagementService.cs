using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Admin.UserManagement;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Security;
using Application.Models;
using Application.Models.Dtos.UserManagement;
using Application.Models.Enums;
using Application.Services.Email;
using Common.Email.TemplateReader;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.Admin.UserManagement;

public class UserManagementService(
    ISecurityService securityService, 
    IUserManagementRepository managementRepository, 
    EmailService emailService, 
    TemplateReader templateReader,
    IDbUnitOfWork unitOfWork,
    ILogger<UserManagementService> logger) : IUserManagementService
{
    
    public async Task<UsersDetailsDto> RegisterUser(RegisterRequestDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var firstName = dto.FirstName.Trim();
        var lastName = dto.LastName.Trim();
        var phone = dto.PhoneNumber.Trim();
        
        if (string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(firstName) ||
            string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(phone))
            throw new ValidationException(ErrorMessages.GetMessage(ErrorCode.InvalidUserData));
        
        
        var existing = managementRepository.GetUserByEmailOrNull(normalizedEmail);
        if (existing is not null) throw new ValidationException(ErrorMessages.GetMessage(ErrorCode.UserAlreadyExists));

        var password = securityService.GenerateRandomPassword(12);
        var salt = securityService.GenerateSalt();
        var hash = securityService.HashPassword(password + salt);

        await unitOfWork.BeginAsync();
        try
        {
            var insertedUser = await managementRepository.AddUser(new User
            {
                Id = Guid.NewGuid(),
                Email = normalizedEmail.ToLower(),
                Firstname = firstName,
                Lastname = lastName,
                Phonenumber = phone,
                Role = Roles.UserRole,
                Isactive = true,
                Profileimageurl = dto.ProfileImageUrl ?? "https://example.com/default-avatar.png",
                Language = dto.Language ?? "ENG",
                Createdat = DateTime.Now,
                Salt = salt,
                Passwordhash = hash,
                Mustchangepassword = true,
            });

            var template = templateReader.LoadTemplate("TemporaryPasswordEmail.html");
            var body = template.Replace("{{CustomerName}}", dto.FirstName)
                .Replace("{{Password}}", password)
                .Replace("{{Email}}", dto.Email);
            
            await emailService.SendEmailAsync(dto.Email, "Your account has been created", body);
            await unitOfWork.CommitAsync();
            
            return UsersDetailsDto.FromEntity(insertedUser);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to register user {Email}: {Error}", dto.Email, ex.Message);
            await unitOfWork.RollbackAsync();
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.RegistrationEmailFailed), ex);
        }
    }

    public async Task<UsersDetailsDto> UpdateUser(UpdateRequestDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var firstName = dto.FirstName.Trim();
        var lastName = dto.LastName.Trim();
        var phone = dto.PhoneNumber.Trim();
        
        if (string.IsNullOrWhiteSpace(normalizedEmail) || string.IsNullOrWhiteSpace(firstName) ||
            string.IsNullOrWhiteSpace(lastName) || string.IsNullOrWhiteSpace(phone))
            throw new ValidationException(ErrorMessages.GetMessage(ErrorCode.InvalidUserData));

        try
        {
            if (!Guid.TryParse(dto.Id, out var userId))
                throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserIdRequired));

            var existingUser = await managementRepository.GetByIdAsync(userId);
            if (existingUser is null)
                throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserNotFound));
            
            if (!string.Equals(existingUser.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            {
                var emailOwner = managementRepository.GetUserByEmailOrNull(normalizedEmail);
                if (emailOwner is not null && emailOwner.Id != existingUser.Id)
                    throw new ValidationException(ErrorMessages.GetMessage(ErrorCode.UserEmailAlreadyExists));
                existingUser.Email = normalizedEmail.ToLower();
            }
            
            existingUser.Firstname = firstName;
            existingUser.Lastname = lastName;
            existingUser.Phonenumber = phone;
            existingUser.Profileimageurl = dto.ProfileImageUrl ?? existingUser.Profileimageurl;
            existingUser.Language = dto.Language ?? existingUser.Language;
            existingUser.Isactive = dto.IsActive ?? existingUser.Isactive;
            existingUser.Isdeleted = dto.IsDeleted ??  existingUser.Isdeleted;
            existingUser.Updatedat = DateTime.Now; 
            
            var updatedUser = await managementRepository.UpdateUser(existingUser);

            return UsersDetailsDto.FromEntity(updatedUser);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update user {Email}: {Error}", dto.Email, ex.Message);
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UpdatingUserFailed), ex);
        }
        
    }

    public async Task<DeleteResponseDto> SoftDelete(string userId)
    {
        if (!Guid.TryParse(userId, out var guid))
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserIdRequired));

        var success = await managementRepository.SoftDelete(guid);
        if (!success)
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserNotFound));

        return DeleteResponseDto.FromObjects(success, SuccessMessages.GetMessage(SuccessCode.UserDeletedSuccess));
    }

    public async Task<GetAllUsersResponseDto> GetAllUsers(int page, int pageSize, string? search, bool? filterIsActive)
    {
        var users = managementRepository.GetAllUsers(page, pageSize, out int totalUsers, search, filterIsActive);
        
        if (users.Count == 0)
        {
            return new GetAllUsersResponseDto
            {
                Items = new List<UsersDetailsDto>(),
                TotalItems = 0,
                Page = page,
                PageSize = 1
            };
        }

        var mappedUsers = users.Select(u =>
        {
            var detailedUser = UsersDetailsDto.FromEntity(u);
            return detailedUser;
        }).ToList();

        return new GetAllUsersResponseDto()
        {
            Items = mappedUsers,
            TotalItems = totalUsers,
            Page = page,
            PageSize = pageSize,
        };
    }
}