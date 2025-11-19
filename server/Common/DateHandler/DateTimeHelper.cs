namespace Common.DateHandler;

public static class DateTimeHelper
{
    public static readonly TimeZoneInfo UkraineTz =
        TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");

    // Convert Ukraine local date and time to UTC for DB storage
    public static DateTime? ToUtc(System.DateTime? ukraineLocal)
    {
        if (!ukraineLocal.HasValue) return null;

        var local = DateTime.SpecifyKind(ukraineLocal.Value, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(local, UkraineTz);
    }

    // Convert UTC from DBto Ukraine local for responses
    public static DateTime? ToUkraine(DateTime? utc)
    {
        if (!utc.HasValue) return null;

        return TimeZoneInfo.ConvertTimeFromUtc(
            DateTime.SpecifyKind(utc.Value, DateTimeKind.Utc),
            UkraineTz
        );
    }

    // Ukrainian time now
    public static DateTime NowUkraine()
    {
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, UkraineTz);
    }

    // Format dates for logs
    public static string FormatUkraine(DateTime? dt)
    {
        if (!dt.HasValue) return "";
        return ToUkraine(dt)?.ToString("yyyy-MM-dd HH:mm:ss") ?? "";
    }
}