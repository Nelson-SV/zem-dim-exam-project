using Core.Domain.Entities;

namespace Application.Interfaces.Infrastructure.Postgres;

public interface ICompanyRepository
{
    Task<Company?> GetCompany();
    Task<Company> UpdateCompany(Company company);
}
