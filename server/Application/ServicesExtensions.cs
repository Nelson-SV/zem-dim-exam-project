using Application.Interfaces.Security;
using Application.Interfaces.UserService;
using Application.Services.Email;
using Application.Services.Security;
using Application.Services.UserService;
using Application.Validators.Admin.UserManagement;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ServicesExtensions
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Fetch SendGrid API Key from Environment Variables
        var sendGridApiKey = Environment.GetEnvironmentVariable("sendgrid");

        if (!string.IsNullOrEmpty(sendGridApiKey))
        {
            services.Configure<AppOptions>(options =>
            {
                options.SendGridApiKey = sendGridApiKey; // Set the API key from environment variables
                options.SendGridApiKey = sendGridApiKey; // Set the API key from environment variables
            });
        }
        else
        {
            // Fallback to reading from appsettings if the API key is not in environment variables
            services.Configure<AppOptions>(configuration.GetSection("AppOptions"));
        }
        
        services.AddValidatorsFromAssemblyContaining<RegisterUserValidator>();
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IUserService, UserService>();
        services.AddTransient<EmailService>();
        return services;
    }
}