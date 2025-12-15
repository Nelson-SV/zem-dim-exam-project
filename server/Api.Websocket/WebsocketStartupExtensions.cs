namespace Api.Websocket;

public static class WebsocketStartupExtensions
{
    public static IServiceCollection RegisterWebsocketApiServices(this IServiceCollection services)
    {
        // 🔌 SignalR
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true;
            options.HandshakeTimeout = TimeSpan.FromSeconds(120);

            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
        });
        return services;
    }
}