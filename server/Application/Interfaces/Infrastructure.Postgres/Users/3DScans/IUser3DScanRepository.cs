using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres.Users._3DScans;

public interface IUser3DScanRepository
{
    Task<List<Project>> GetScansByClientIdAsync(Guid clientId);
}