using Application.Interfaces.Admin.UserManagement;
using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Application.Services.Admin.UserManagement;
using Application.Services.Email;
using Application.Services.MessageService;
using Application.Services.ProjectService;
using Application.Services.Security;
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
        services.AddValidatorsFromAssemblyContaining<UpdateUserValidator>();
        
        
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddTransient<EmailService>();
        return services;
    }
}