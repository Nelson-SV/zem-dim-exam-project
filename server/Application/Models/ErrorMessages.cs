namespace Application.Models;

public enum ErrorCode
{
    UserIdRequired,
    InvalidUserEmail,
    UnexpectedError,
    UserAlreadyExists,
    RegistrationEmailFailed,
}

public static class ErrorMessages
{
    private static readonly Dictionary<ErrorCode, string> _errorMessages = new()
    {
        { ErrorCode.UserIdRequired, "Id is required" },
        { ErrorCode.InvalidUserEmail, "Invalid user email" },
        { ErrorCode.UnexpectedError, "An unexpected error occured, please try again" },
        { ErrorCode.UserAlreadyExists, "User already exists" },
        { ErrorCode.RegistrationEmailFailed, "Failed to send email to the user. Registration rolled back and user was deleted." },
        
    };
    
    public static string GetMessage(ErrorCode errorCode)
    {
        return _errorMessages.GetValueOrDefault(errorCode, "This error is undefined");
    }
}