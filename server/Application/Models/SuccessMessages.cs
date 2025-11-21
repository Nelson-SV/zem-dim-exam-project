namespace Application.Models;

public enum SuccessCode
{
    UserDeletedSuccess,
    UserResetPasswordSuccess,
    ThreeDScanDeletedSuccess
}

public static class SuccessMessages
{
    private static readonly Dictionary<SuccessCode, string> _successMessages = new()
    {
        { SuccessCode.UserDeletedSuccess, "User deleted  successfully." },
        { SuccessCode.UserResetPasswordSuccess, "User password reset made successfully." },
        { SuccessCode.ThreeDScanDeletedSuccess, "3D scan deleted successfully." },

    };
    
    public static string GetMessage(SuccessCode code)
    {
        return _successMessages.GetValueOrDefault(code, "Process Successful");
    }
}