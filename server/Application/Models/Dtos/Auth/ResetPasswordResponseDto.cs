namespace Application.Models.Dtos.Auth;

public class ResetPasswordResponseDto
{
    public bool Status { get; set; }
    public string? Message { get; set; }
    
    
    public static ResetPasswordResponseDto FromObjects(bool status,  string? message)
    {
        return new ResetPasswordResponseDto
        {
            Status = status,
            Message = message,
        };
    }
}