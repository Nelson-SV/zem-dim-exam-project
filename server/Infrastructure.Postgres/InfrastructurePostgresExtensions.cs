using Application;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Infrastructure.Postgres.Repositories.Admin.UserManagement;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Infrastructure.Postgres;

public static class InfrastructurePostgresExtensions
{
    public static IServiceCollection AddDataSourceAndRepositories(this IServiceCollection services)
    {
        services.AddDbContext<AppDbContext>((service, options) =>
        {
            var provider = services.BuildServiceProvider();
            options.UseNpgsql(
                provider.GetRequiredService<IOptionsMonitor<AppOptions>>().CurrentValue.DbConnectionString);
            options.EnableSensitiveDataLogging();
        });

        services.AddScoped<IAdminUserManagementRepository, AdminUserManagementRepository>();
        services.AddScoped<Seeder.Seeder>();

        return services;
    }
}