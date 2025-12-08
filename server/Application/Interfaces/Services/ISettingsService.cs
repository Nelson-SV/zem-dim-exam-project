using Application.Models.Dtos.Settings;

namespace Application.Interfaces.Services;

public interface ISettingsService
{
    Task<CompanyDto> GetCompanyInfo();
    Task<CompanyDto> UpdateCompanyInfo(UpdateCompanyDto dto);
    Task<UserSettingsDto> GetUserSettings(Guid userId);
    Task<UserSettingsDto> UpdateUserSettings(Guid userId, UpdateUserSettingsDto dto);
}
