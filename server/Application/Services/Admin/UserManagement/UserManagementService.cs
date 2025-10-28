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
    public List<User> GetAll()
    {
        throw new NotImplementedException();
    }

    public User? GetUserById(string email)
    {
        throw new NotImplementedException();
    }
    
    public async Task<RegisterResponseDto> RegisterUser(RegisterRequestDto dto)
    {
        var existing = managementRepository.GetUserByEmailOrNull(dto.Email);
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
                Email = dto.Email,
                Firstname = dto.FirstName,
                Lastname = dto.LastName,
                Phonenumber = dto.PhoneNumber,
                Role = Roles.UserRole,
                Isactive = true,
                Profileimageurl = dto.ProfileImageUrl ?? "https://example.com/default-avatar.png",
                Language = dto.Language ?? "en",
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
            
            return RegisterResponseDto.FromEntity(insertedUser);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to register user {Email}: {Error}", dto.Email, ex.Message);
            await unitOfWork.RollbackAsync();
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.RegistrationEmailFailed), ex);
        }
    }

    public async Task<UpdateResponseDto> UpdateUser(UpdateRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.InvalidUserEmail));

        try
        {
            var existingUser = managementRepository.GetUserByIdOrNull(Guid.Parse(dto.Id));
            if (existingUser is null)
                throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserNotFound));
            existingUser.Email = dto.Email;
            existingUser.Firstname = dto.FirstName;
            existingUser.Lastname = dto.LastName;
            existingUser.Phonenumber = dto.PhoneNumber;
            existingUser.Profileimageurl = dto.ProfileImageUrl ?? existingUser.Profileimageurl;
            existingUser.Language = dto.Language ?? existingUser.Language;
            existingUser.Updatedat = DateTime.Now; 
            
            var updatedUser = await managementRepository.UpdateUser(existingUser);

            return UpdateResponseDto.FromEntity(updatedUser);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update user {Email}: {Error}", dto.Email, ex.Message);
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UpdatingUserFailed), ex);
        }
        
    }

    public bool DeleteUser(string userId)
    {
        if (userId == null)
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserIdRequired));
        }

        Guid.TryParse(userId, out var guid);
        var result = managementRepository.DeleteUser(guid);

        if (!result)
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UnexpectedError));
        }
        
        return result;
    }
}