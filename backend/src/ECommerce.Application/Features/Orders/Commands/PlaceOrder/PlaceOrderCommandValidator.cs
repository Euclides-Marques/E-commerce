using FluentValidation;

namespace ECommerce.Application.Features.Orders.Commands.PlaceOrder;

public class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(x => x.ShippingAddressId).NotEmpty().WithMessage("Endereço de entrega é obrigatório.");
    }
}
