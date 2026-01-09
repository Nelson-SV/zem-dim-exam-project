using Core.Domain.Entities;

namespace Application.Interfaces.Auth;

public interface IRefreshTokenRepository
{
    Task AddAsync(Guid userId, string tokenHash, DateTimeOffset expiresAt);
    Task<Refreshtoken?> GetActiveByHashAsync(string tokenHash);
    Task RevokeAllForUserAsync(Guid userId, DateTimeOffset revokedAt);
}
