using FluentValidation;

namespace ECommerce.Application.Features.Addresses.Commands.UpdateAddress;

public class UpdateAddressCommandValidator : AbstractValidator<UpdateAddressCommand>
{
    public UpdateAddressCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Label).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Recipient).NotEmpty().MaximumLength(150);
        RuleFor(x => x.ZipCode).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Street).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Number).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Neighborhood).NotEmpty().MaximumLength(100);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(2);
    }
}
