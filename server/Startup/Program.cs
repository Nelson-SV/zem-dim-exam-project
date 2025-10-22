using Api.Rest;
using Application;
using Common.Email.Configurations;
using Common.Email.TemplateReader;
using Infrastructure.Postgres;
using Infrastructure.Postgres.Seeder;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using NSwag.Generation;
using Startup.Documentation;

namespace Startup;

public class Program
{
    public static async Task Main()
    {
        var builder = WebApplication.CreateBuilder();
        ConfigureServices(builder.Services, builder.Configuration);
        var app = builder.Build();
        await ConfigureMiddleware(app);
        //var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
        //var url = $"http://0.0.0.0:{port}";
        //await app.RunAsync(url);
        await app.RunAsync();
    }

    public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        var appOptions = services.AddAppOptions(configuration);

        services.RegisterApplicationServices(configuration);

        services.AddDataSourceAndRepositories();
        //services.AddWebsocketInfrastructure();

        //services.RegisterWebsocketApiServices();
        services.RegisterRestApiServices(configuration);
        services.AddOpenApiDocument(conf =>
        {
            conf.DocumentProcessors.Add(new AddAllDerivedTypesProcessor());
            conf.DocumentProcessors.Add(new AddStringConstantsProcessor());
        });
        //services.AddSingleton<IProxyConfig, ProxyConfig>();
        
        /* Bind EmailSettings*/
        services.Configure<EmailSettings>(configuration.GetSection("AppOptions"));
        services.AddSingleton<TemplateReader>();
    }

    public static async Task ConfigureMiddleware(WebApplication app)
    {
        var appOptions = app.Services.GetRequiredService<IOptionsMonitor<AppOptions>>().CurrentValue;

        using (var scope = app.Services.CreateScope())
        {
            if (appOptions.Seed)
                await scope.ServiceProvider.GetRequiredService<Seeder>().Seed();
        }


        app.Urls.Clear();
        app.Urls.Add($"http://0.0.0.0:{appOptions.REST_PORT}");
        //app.Services.GetRequiredService<IProxyConfig>()
            //.StartProxyServer(appOptions.PORT, appOptions.REST_PORT, appOptions.WS_PORT);

        app.ConfigureRestApi();
        //await app.ConfigureWebsocketApi(appOptions.WS_PORT);


        app.MapGet("Acceptance", () => "Accepted");
        
        app.UseOpenApi(conf => { conf.Path = "openapi/v1.json"; });

        var document = await app.Services.GetRequiredService<IOpenApiDocumentGenerator>().GenerateAsync("v1");
        var json = document.ToJson();
        await File.WriteAllTextAsync("openapi.json", json);

        app.GenerateTypeScriptClient("/../../client/src/generated-client.ts").GetAwaiter().GetResult();
        
    }
}