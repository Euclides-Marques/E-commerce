using FluentValidation;

namespace ECommerce.Application.Features.Cart.Commands.AddToCart;

public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("Produto é obrigatório.");
        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantidade deve ser maior que zero.");
    }
}
