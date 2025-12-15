using Core.Domain.Entities;

namespace Application.Models.Dtos.Settings;

public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? Currency { get; set; }

    public static CompanyDto FromEntity(Company company)
    {
        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Email = company.Email,
            Phone = company.Phone,
            Website = company.Website,
            Address = company.Address,
            Currency = company.Currency
        };
    }
}
