using System.ComponentModel.DataAnnotations;

namespace Application.Models.Dtos.UserManagement;

public class GetAllUsersResponseDto
{
    public required List<UsersDetailsDto> Items { get; set; }
    public int TotalItems { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}