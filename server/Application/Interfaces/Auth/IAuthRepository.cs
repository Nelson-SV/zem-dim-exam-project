using Core.Domain.Entities;

namespace Application.Interfaces.Auth;

public interface IAuthRepository
{
    Task<bool> SavePasswordFromResetAsync(User user);
}