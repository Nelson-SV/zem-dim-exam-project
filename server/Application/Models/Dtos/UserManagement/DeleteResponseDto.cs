namespace Application.Models.Dtos.UserManagement;

public class DeleteResponseDto
{
    public bool Status { get; set; }
    public string? Message { get; set; }
    
    
    public static DeleteResponseDto FromObjects(bool status,  string? message)
    {
        return new DeleteResponseDto
        {
            Status = status,
            Message = message,
        };
    }
}