namespace Common.Responses;

public class ApiErrorResponse
{
    public string Code { get; set; } = "UNDEFINED";
    public string Message { get; set; } = "An unexpected error occurred.";
    public string? TraceId { get; set; }
    public int Status { get; set; }
}