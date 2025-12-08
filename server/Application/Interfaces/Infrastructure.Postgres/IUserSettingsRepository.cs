using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUserSettingsRepository
{
    Task<Usersetting?> GetByUserId(Guid userId);
    Task<Usersetting> Create(Usersetting settings);
    Task<Usersetting> Update(Usersetting settings);
}
