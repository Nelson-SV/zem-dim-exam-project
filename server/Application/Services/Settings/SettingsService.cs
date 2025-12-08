using System.ComponentModel.DataAnnotations;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Services;
using Application.Models.Dtos.Settings;
using Core.Domain.Entities;

namespace Application.Services.Settings;

public class SettingsService(
    ICompanyRepository companyRepository,
    IUserSettingsRepository userSettingsRepository) : ISettingsService
{
    public async Task<CompanyDto> GetCompanyInfo()
    {
        var company = await companyRepository.GetCompany();
        if (company == null)
            throw new ValidationException("Company information not found");

        return CompanyDto.FromEntity(company);
    }

    public async Task<CompanyDto> UpdateCompanyInfo(UpdateCompanyDto dto)
    {
        var company = await companyRepository.GetCompany();
        if (company == null)
            throw new ValidationException("Company information not found");

        // Update company properties
        company.Name = dto.Name;
        company.Email = dto.Email;
        company.Phone = dto.Phone;
        company.Website = dto.Website;
        company.Address = dto.Address;
        company.Currency = dto.Currency;
        company.Updatedat = DateTime.UtcNow;

        var updated = await companyRepository.UpdateCompany(company);
        return CompanyDto.FromEntity(updated);
    }

    public async Task<UserSettingsDto> GetUserSettings(Guid userId)
    {
        var settings = await userSettingsRepository.GetByUserId(userId);

        // Create defaults if settings don't exist
        if (settings == null)
        {
            settings = new Usersetting
            {
                Id = Guid.NewGuid(),
                Userid = userId,
                Emailalerts = true,
                Reportfrequency = "Weekly",
                Clientupdates = true,
                Createdat = DateTime.UtcNow,
                Updatedat = DateTime.UtcNow
            };

            settings = await userSettingsRepository.Create(settings);
        }

        return UserSettingsDto.FromEntity(settings);
    }

    public async Task<UserSettingsDto> UpdateUserSettings(Guid userId, UpdateUserSettingsDto dto)
    {
        var settings = await userSettingsRepository.GetByUserId(userId);

        // Create if doesn't exist
        if (settings == null)
        {
            settings = new Usersetting
            {
                Id = Guid.NewGuid(),
                Userid = userId,
                Emailalerts = dto.EmailAlerts,
                Reportfrequency = dto.ReportFrequency,
                Clientupdates = dto.ClientUpdates,
                Createdat = DateTime.UtcNow,
                Updatedat = DateTime.UtcNow
            };

            var created = await userSettingsRepository.Create(settings);
            return UserSettingsDto.FromEntity(created);
        }

        // Update existing
        settings.Emailalerts = dto.EmailAlerts;
        settings.Reportfrequency = dto.ReportFrequency;
        settings.Clientupdates = dto.ClientUpdates;
        settings.Updatedat = DateTime.UtcNow;

        var updated = await userSettingsRepository.Update(settings);
        return UserSettingsDto.FromEntity(updated);
    }
}
