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
        
        /*
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
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole(Roles.AdminRole));
        });
        */

        return services;
    }

    public static WebApplication ConfigureRestApi(this WebApplication app)
    {
        app.UseExceptionHandler();
        
        //Add authentication + authorization to the pipeline
        app.UseAuthentication();
        app.UseMiddleware<JwtUserValidationMiddleware>();
        app.UseAuthorization();

        app.MapControllers();
        app.UseCors(opts => opts.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
        return app;
    }
}