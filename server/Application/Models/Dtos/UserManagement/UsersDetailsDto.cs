using Application.Models.Dtos.Project;
using Core.Domain.Entities;

namespace Application.Models.Dtos.UserManagement;

public class UsersDetailsDto
{
    public string UserId { get; set; }
    public string Email { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Language { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDeleted { get; set; }
    public DateTime? CreatedAt { get; set; }
    public List<ProjectDto> Projects { get; set; }
    
    
    public static UsersDetailsDto FromEntity(User user)
    {
        return new UsersDetailsDto
        {
            UserId = user.Id.ToString(),
            FirstName = user.Firstname,
            LastName = user.Lastname,
            Email = user.Email,
            PhoneNumber = user.Phonenumber,
            ProfileImageUrl = user.Profileimageurl,
            Language = user.Language,
            IsActive =  user.Isactive,
            IsDeleted =   user.Isdeleted,
            CreatedAt = user.Createdat,
            Projects = ProjectDto.FromEntityToList(user.Projects.ToList())
        };
    }
}