using Api.Websocket.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Websocket.Extensions;

public static class WebsocketExtensions
{
    public static IServiceCollection AddWebsocketServices(this IServiceCollection services)
    {
        // Add SignalR
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true; 
            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
        });

        return services;
    }

    public static IApplicationBuilder UseWebsocketEndpoints(this IApplicationBuilder app)
    {
        // SignalR Hub Maps
        app.UseRouting();
        
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapHub<ChatHub>("/hubs/chat");
        });

        return app;
    }
}