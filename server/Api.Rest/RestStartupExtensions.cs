using System.Text;
using Api.Rest.Middleware;
using Application.Models.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Api.Rest;

public static class RestStartupExtensions
{
    public static IServiceCollection RegisterRestApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails();

        var controllersAssembly = typeof(RestStartupExtensions).Assembly;
        services.AddControllers().AddApplicationPart(controllersAssembly);


        //JWT Authentication setup
        var jwtSecret = configuration["AppOptions:JwtSecret"];
        if (string.IsNullOrEmpty(jwtSecret))
            throw new InvalidOperationException("JwtSecret is missing in configuration");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                    ClockSkew = TimeSpan.Zero,

                    ValidAlgorithms = new[]
                {
                    SecurityAlgorithms.HmacSha512Signature,
                    SecurityAlgorithms.HmacSha512
                }

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

                // I think we dont need this, but will keep here in case you need for something Andri
                // If now we delete
                /*
                IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
                    new[] { signingKey },

                RequireSignedTokens = true,
                TryAllIssuerSigningKeys = true,
                NameClaimType = JwtRegisteredClaimNames.Email,
                RoleClaimType = ClaimTypes.Role
            };
            */

            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Roles.AdminRole, policy => policy.RequireRole(Roles.AdminRole));
            options.AddPolicy(Roles.UserRole, policy => policy.RequireRole(Roles.UserRole));
        });


        return services;
    }

    public static WebApplication ConfigureRestApi(this WebApplication app)
    {
        app.UseExceptionHandler();
        app.UseMiddleware<JwtUserValidationMiddleware>();

        app.MapControllers();
        app.UseCors(opts => opts.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
        return app;
    }
}