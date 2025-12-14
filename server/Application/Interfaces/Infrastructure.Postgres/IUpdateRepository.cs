using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface IUpdateRepository
{
    Task<(IReadOnlyCollection<Update> Items, int Total)> GetUpdatesAsync(
        int page,
        int pageSize,
        Guid? projectId,
        string? updateType,
        string? search);
}
