using Application.Interfaces.Infrastructure.Postgres.DatabaseTransactions;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore.Storage;

namespace Infrastructure.Postgres.DatabaseTransactions;

public class DbUnitOfWork : IDbUnitOfWork
{
    private readonly AppDbContext _context;
    private IDbContextTransaction? _transaction;

    public DbUnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public async Task BeginAsync()
        => _transaction = await _context.Database.BeginTransactionAsync();

    public async Task CommitAsync()
        => await (_transaction?.CommitAsync() ?? Task.CompletedTask);

    public async Task RollbackAsync()
        => await (_transaction?.RollbackAsync() ?? Task.CompletedTask);
}