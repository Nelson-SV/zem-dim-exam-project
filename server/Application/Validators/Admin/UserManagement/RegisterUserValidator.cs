using Application.Models.Dtos.UserManagement;
using FluentValidation;

namespace Application.Validators.Admin.UserManagement;

public class RegisterUserValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email address format.");
        
        RuleFor(x => x.FirstName)
            .Cascade(CascadeMode.Stop)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("First name is required.")
            .Must(name => name!.Trim().Length >= 2)
            .WithMessage("First name must be at least 2 characters.")
            .Must(name => name!.Trim().Length <= 50)
            .WithMessage("First name must not exceed 50 characters.");


        RuleFor(x => x.LastName)
            .Cascade(CascadeMode.Stop)
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("Last name is required.")
            .Must(name => name!.Trim().Length >= 2)
            .WithMessage("Last name must be at least 2 characters.")
            .Must(name => name!.Trim().Length <= 50)
            .WithMessage("Last name must not exceed 50 characters.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .Matches(@"^\+?\d{8,15}$")
            .WithMessage("Phone number must be numeric, optionally start with +, and be 8–15 digits long.");

    }
}