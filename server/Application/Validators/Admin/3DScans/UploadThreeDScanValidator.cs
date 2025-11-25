using Application.Models.Dtos._3DScans;
using FluentValidation;

namespace Application.Validators.Admin._3DScans;

public class UploadThreeDScanValidator : AbstractValidator<UploadThreeDScanRequestDto>
{
    public UploadThreeDScanValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.RoomName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.RoomArea).GreaterThan(0);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}