using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Admin.UserManagement;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Security;
using Application.Models;
using Application.Models.Dtos.UserManagement;
using Application.Models.Enums;
using Application.Services.Email;
using Application.Services.Security;
using Common.Email.TemplateReader;
using Core.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace Application.Services.Admin.UserManagement;

public class UserManagementManagementService(
    ISecurityService securityService, 
    IAdminUserManagementRepository managementRepository, 
    EmailService emailService, 
    TemplateReader templateReader,
    IDbUnitOfWork unitOfWork,
    ILogger<SecurityService> logger) : IUserManagementService
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
            var insertedUser = managementRepository.AddUser(new User
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
            //managementRepository.DeleteUser(insertedUser.Id);
            logger.LogError(ex, "Failed to register user {Email}: {Error}", dto.Email, ex.Message);
            await unitOfWork.RollbackAsync();
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.RegistrationEmailFailed), ex);
        }
    }

    public UpdateResponseDto UpdateUser(UpdateRequestDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.InvalidUserEmail));
        }

        var updatedUser = adminUserManagementRepository.UpdateUserEmail(new User
        {
            Id = Guid.Parse(request.UserId),
            Email = request.Email
        });

        return new UpdateResponseDto
        {
            Email = updatedUser.Email,
            UserId = updatedUser.Id.ToString()
        };
    }

    public bool DeleteUser(string userId)
    {
        if (userId == null)
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UserIdRequired));
        }

        Guid.TryParse(userId, out var guid);
        var result = adminUserManagementRepository.DeleteUser(guid);

        if (!result)
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UnexpectedError));
        }
        
        return result;
    }
}