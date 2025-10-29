namespace Application.Models;

public enum SuccessCode
{
    UserDeletedSuccess,
}

public static class SuccessMessages
{
    private static readonly Dictionary<SuccessCode, string> _successMessages = new()
    {
        { SuccessCode.UserDeletedSuccess, "User deleted  successfully." },
    };
    
    public static string GetMessage(SuccessCode code)
    {
        return _successMessages.GetValueOrDefault(code, "Process Successful");
    }
}