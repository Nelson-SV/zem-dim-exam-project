using Application.Interfaces.Security;
using Application.Interfaces.Services;
using Application.Interfaces.UserService;
using Application.Services.MessageService;
using Application.Services.ProjectService;
using Application.Services.Security;
using Application.Services.UserService;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ServicesExtensions
{
    public static IServiceCollection RegisterApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ISecurityService, SecurityService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IProjectService, ProjectService>(); 
        return services;
    }
}