using FluentValidation;

namespace ECommerce.Application.Features.Cart.Commands.UpdateCartItem;

public class UpdateCartItemCommandValidator : AbstractValidator<UpdateCartItemCommand>
{
    public UpdateCartItemCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("Produto é obrigatório.");
        RuleFor(x => x.Quantity).GreaterThanOrEqualTo(0).WithMessage("Quantidade não pode ser negativa.");
    }
}
