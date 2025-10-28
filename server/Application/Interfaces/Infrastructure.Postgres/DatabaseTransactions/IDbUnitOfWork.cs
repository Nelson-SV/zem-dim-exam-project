namespace Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;

public interface IDbUnitOfWork
{
    Task BeginAsync();
    Task CommitAsync();
    Task RollbackAsync();
}