using Application.Interfaces.Admin.UserManagement;
using Application.Interfaces.Documents;
using Application.Interfaces.Infrastructure.Postgres.Users._3DScans;
using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Application.Interfaces.Users._3DScans;
using Application.Services;
using Application.Services.Admin.UserManagement;
using Application.Services.Documents;
using Application.Services.Email;
using Application.Services.MessageService;
using Application.Services.ProjectService;
using Application.Services.Security;
using Application.Services.Storage;
using Application.Services.Users._3DScans;
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
        
        services.AddHttpClient();
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<IUser3DScanService, User3DScanService>();
        services.AddTransient<EmailService>();
        services.AddScoped<IPdfSignatureService, PdfSignatureService>();
        services.AddScoped<IStorageService, SupabaseStorageService>();
        services.AddScoped<IDocumentsService, DocumentsService>();

        return services;
    }
}