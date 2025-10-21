using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.UserService;
using Application.Models;
using Application.Models.Dtos.UserManagement;
using Core.Domain.Entities;

namespace Application.Services.UserService;

public class UserService(IUserRepository userRepository) : IUserService
{
    public List<User> GetAll()
    {
        throw new NotImplementedException();
    }

    public User? GetUserById(string email)
    {
        throw new NotImplementedException();
    }

    public UpdateUserResponseDto UpdateUser(UpdateUserDto user)
    {
        if (user == null || string.IsNullOrWhiteSpace(user.Email))
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.InvalidUserEmail));
        }

        var updatedUser = userRepository.UpdateUserEmail(new User
        {
            Id = Guid.Parse(user.UserId),
            Email = user.Email
        });

        return new UpdateUserResponseDto
        {
            Email = updatedUser.Email,
            UserId = updatedUser.Id.ToString()
        };
    }

    public bool DeleteUser(string userId)
    {
        if (userId == null)
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.ErrorUserId));
        }

        var result = userRepository.DeleteUser(userId);

        if (!result)
        {
            throw new ApplicationException(ErrorMessages.GetMessage(ErrorCode.UnexpectedError));
        }
        
        return result;
    }
}