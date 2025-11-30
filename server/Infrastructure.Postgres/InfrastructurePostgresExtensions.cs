

using Application;
using Application.Interfaces.Auth;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin._3DScans;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Users._3DScans;
using Infrastructure.Postgres.DatabaseTransactions;
using Infrastructure.Postgres.Repositories;
using Infrastructure.Postgres.Repositories.Admin._3DScans;
using Infrastructure.Postgres.Repositories.Admin.UserManagement;
using Infrastructure.Postgres.Repositories.Auth;
using Infrastructure.Postgres.Repositories.Users._3DScans;
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

        
        services.AddScoped<IDbUnitOfWork, DbUnitOfWork>();
        services.AddScoped<Seeder.Seeder>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IMilestoneRepository, MilestoneRepository>();
        services.AddScoped<IPhotoRepository, PhotoRepository>();
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<IUserManagementRepository, UserManagementRepository>();
        services.AddScoped<IUser3DScanRepository, User3DScanRepository>();
        services.AddScoped<IAdmin3DScanRepository, Admin3DScanRepository>();
        services.AddScoped<IUpdateRepository, UpdateRepository>();
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IDocumentSignatureRepository, DocumentSignatureRepository>();

        return services;
    }
}