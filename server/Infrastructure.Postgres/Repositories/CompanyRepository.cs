using Application.Interfaces.Infrastructure.Postgres;
using Core.Domain.Entities;
using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Repositories;

public class CompanyRepository(AppDbContext ctx) : ICompanyRepository
{
    public async Task<Company?> GetCompany()
    {
        // Return the first (and only) company record
        return await ctx.Companies.FirstOrDefaultAsync();
    }

    public async Task<Company> UpdateCompany(Company company)
    {
        var existing = await ctx.Companies.AsTracking().FirstOrDefaultAsync(c => c.Id == company.Id);
        if (existing == null)
            throw new InvalidOperationException("Company not found");

        ctx.Entry(existing).CurrentValues.SetValues(company);
        await ctx.SaveChangesAsync();
        return existing;
    }
}
