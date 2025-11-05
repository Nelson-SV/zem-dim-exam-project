using System.ComponentModel.DataAnnotations;
using Core.Domain.Entities;

namespace Application.Models.Dtos.UserManagement;

public class UpdateResponseDto
{
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Language { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDeleted { get; set; }
    public DateTime? CreatedAt { get; set; }
    
    
    public static UpdateResponseDto FromEntity(User user)
    {
        return new UpdateResponseDto
        {
            FirstName = user.Firstname,
            LastName = user.Lastname,
            Email = user.Email,
            PhoneNumber = user.Phonenumber,
            ProfileImageUrl = user.Profileimageurl,
            Language = user.Language,
            IsActive =  user.Isactive,
            IsDeleted =   user.Isdeleted,
            CreatedAt = user.Createdat
        };
    }
}