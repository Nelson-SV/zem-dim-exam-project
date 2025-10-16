using Application.Interfaces.Security;
using Application.Interfaces.UserService;
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
        return services;
    }
}