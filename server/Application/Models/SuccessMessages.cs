namespace Application.Models;

public enum SuccessCode
{
    Example,
}

public static class SuccessMessages
{
    private static readonly Dictionary<SuccessCode, string> _successMessages = new()
    {
        { SuccessCode.Example, "Example" },
    };
    
    public static string GetMessage(SuccessCode code)
    {
        return _successMessages.GetValueOrDefault(code, "Process Successful");
    }
}