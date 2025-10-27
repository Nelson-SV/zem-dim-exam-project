using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.Auth;

public class RegisterRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required, MinLength(2)]
    public string FirstName { get; set; } = null!;

    [Required, MinLength(2)]
    public string LastName { get; set; } = null!;

    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Language { get; set; }
    
    
    public static RegisterRequestDto FromEntity(User user)
    {
        return new RegisterRequestDto
        {
            FirstName = user.Firstname,
            LastName = user.Lastname,
            Email = user.Email,
            PhoneNumber = user.Phonenumber,
            ProfileImageUrl = user.Profileimageurl,
            Language = user.Language,
        };
    }

}