namespace Application.Models;

public enum ErrorCode
{
    ErrorUserId,
    InvalidUserEmail,
    UnexpectedError,
}

public static class ErrorMessages
{
    private static readonly Dictionary<ErrorCode, string> _errorMessages = new()
    {
        { ErrorCode.ErrorUserId, "Id is required" },
        { ErrorCode.InvalidUserEmail, "Invalid user email" },
        { ErrorCode.UnexpectedError, "An unexpected error occured, please try again" },
        
    };
    
    public static string GetMessage(ErrorCode errorCode)
    {
        return _errorMessages.GetValueOrDefault(errorCode, "This error is undefined");
    }
}