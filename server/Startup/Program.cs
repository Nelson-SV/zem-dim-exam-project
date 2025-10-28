using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Rest;
using Api.Websocket.Hubs;
using Application;
using Common.Email.Configurations;
using Common.Email.TemplateReader;
using Infrastructure.Postgres;
using Infrastructure.Postgres.Seeder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NSwag.Generation;
using Serilog;
using Serilog.Events;
using Startup.Documentation;

namespace Startup;

public class Program
{
    public static async Task Main()
    {
        // --- Configure Serilog before building the app ---
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug() // or Information if you want less detail
            .WriteTo.Console()
            .WriteTo.File(
                path: "logs/log-.txt",
                rollingInterval: RollingInterval.Day, // new file per day
                retainedFileCountLimit: 7, // keep only last 7 days (optional)
                restrictedToMinimumLevel: LogEventLevel.Information)
            .CreateLogger();
        try
        {
            Log.Information("Starting up...");
            var builder = WebApplication.CreateBuilder();
            builder.Host.UseSerilog(); //Integrate Serilog with ASP.NET logging


            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();


            ConfigureServices(builder.Services, builder.Configuration);
            var app = builder.Build();
            await ConfigureMiddleware(app);
            //var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
            //var url = $"http://0.0.0.0:{port}";
            //await app.RunAsync(url);
            await app.RunAsync();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Application start-up failed");
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }

    public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
    {
        var appOptions = services.AddAppOptions(configuration);

        services.RegisterApplicationServices(configuration);

        services.AddDataSourceAndRepositories();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSecret = (appOptions.JwtSecret ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(jwtSecret))
            throw new InvalidOperationException("JwtSecret is empty or missing. Check configuration.");

         
        Console.WriteLine($"[AUTH] JwtSecret len={jwtSecret.Length}, head={jwtSecret[..3]}, tail={jwtSecret[^3..]}");

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

        options.RequireHttpsMetadata = false;
        options.MapInboundClaims = false; 

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,

            
            ValidAlgorithms = new[]
            {
                SecurityAlgorithms.HmacSha512Signature,
                SecurityAlgorithms.HmacSha512
            },

            
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
                new[] { signingKey },

            RequireSignedTokens = true,
            TryAllIssuerSigningKeys = true,
            NameClaimType = JwtRegisteredClaimNames.Email,
            RoleClaimType = ClaimTypes.Role
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    context.Token = accessToken;
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[AUTH][FAILED] {context.Exception.GetType().Name}: {context.Exception.Message}");
                if (context.Exception.InnerException != null)
                    Console.WriteLine($"[AUTH][FAILED][INNER] {context.Exception.InnerException.GetType().Name}: {context.Exception.InnerException.Message}");
                return Task.CompletedTask;
            }
        };
    });


        services.AddAuthorization();

        // 🔌 SignalR
        services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = true;
            options.HandshakeTimeout = TimeSpan.FromSeconds(120);

            options.KeepAliveInterval = TimeSpan.FromSeconds(15);
            options.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
        });
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

            app.UseRouting();

            app.UseCors(policy => policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .SetIsOriginAllowed(_ => true)
                .AllowCredentials());

            app.UseAuthentication();
            app.UseAuthorization();
            
        app.ConfigureRestApi();
        app.MapHub<ChatHub>("/hubs/chat").RequireAuthorization();

        //await app.ConfigureWebsocketApi(appOptions.WS_PORT);


        app.MapGet("Acceptance", () => "Accepted");
        
        app.UseOpenApi(conf => { conf.Path = "openapi/v1.json"; });

        var document = await app.Services.GetRequiredService<IOpenApiDocumentGenerator>().GenerateAsync("v1");
        var json = document.ToJson();
        await File.WriteAllTextAsync("openapi.json", json);

        app.GenerateTypeScriptClient("/../../client/src/generated-client.ts").GetAwaiter().GetResult();
        
    }
}
