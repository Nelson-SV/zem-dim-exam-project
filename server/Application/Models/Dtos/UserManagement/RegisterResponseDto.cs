using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.UserManagement;

public class RegisterResponseDto
{
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Language { get; set; }
    public DateTime? CreatedAt { get; set; }
    
    
    public static RegisterResponseDto FromEntity(User user)
    {
        return new RegisterResponseDto
        {
            FirstName = user.Firstname,
            LastName = user.Lastname,
            Email = user.Email,
            PhoneNumber = user.Phonenumber,
            ProfileImageUrl = user.Profileimageurl,
            Language = user.Language,
            CreatedAt = user.Createdat
        };
    }

}
