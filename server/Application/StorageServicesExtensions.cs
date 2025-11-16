 

using Application.Interfaces.Services;
using Application.Services.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Supabase;

namespace Application;

public static class StorageServicesExtensions
{
    public static IServiceCollection RegisterStorageServices(this IServiceCollection services)
    {
        services.AddSingleton<Client>(provider =>
        {
            var appOptions = provider.GetRequiredService<IOptionsMonitor<AppOptions>>().CurrentValue;

            var options = new SupabaseOptions { AutoConnectRealtime = false };
            var client = new Client(appOptions.SupabaseUrl, appOptions.SupabaseKey, options);
            client.InitializeAsync().GetAwaiter().GetResult();
            return client;
        });

        services.AddScoped<IStorageService, SupabaseStorageService>();
        return services;
    }
}