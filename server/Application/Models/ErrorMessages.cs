namespace Application.Models;

public enum ErrorCode
{
    UserIdRequired,
    InvalidUserEmail,
    UnexpectedError,
    UserAlreadyExists,
    RegistrationEmailFailed,
    UpdatingUserFailed,
    UserNotFound,
    DeletingUserFailed,
    GettingAllUsersFailed
}

public static class ErrorMessages
{
    private static readonly Dictionary<ErrorCode, string> _errorMessages = new()
    {
        { ErrorCode.UserIdRequired, "Id is required." },
        { ErrorCode.InvalidUserEmail, "Invalid user email." },
        { ErrorCode.UnexpectedError, "An unexpected error occured, please try again." },
        { ErrorCode.UserAlreadyExists, "User already exists." },
        { ErrorCode.RegistrationEmailFailed, "Failed to send email to the user. Registration rolled back and user was deleted." },
        { ErrorCode.UpdatingUserFailed, "Failed to update the user, please try again later." },
        { ErrorCode.UserNotFound, "User not found, please try again." },
        { ErrorCode.DeletingUserFailed, "Failed to delete the user, please try again later." },
        { ErrorCode.GettingAllUsersFailed, "Failed to fetching all users, please try again later." },

        
    };
    
    public static string GetMessage(ErrorCode errorCode)
    {
        return _errorMessages.GetValueOrDefault(errorCode, "This error is undefined.");
    }
}