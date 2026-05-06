using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome do produto é obrigatório.")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Descrição é obrigatória.")
            .MaximumLength(5000).WithMessage("Descrição deve ter no máximo 5000 caracteres.");

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU é obrigatório.")
            .MaximumLength(100).WithMessage("SKU deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Preço deve ser maior que zero.");

        RuleFor(x => x.OriginalPrice)
            .GreaterThan(0).WithMessage("Preço original deve ser maior que zero.")
            .When(x => x.OriginalPrice.HasValue);

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Quantidade em estoque não pode ser negativa.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória.");

        RuleFor(x => x.Weight)
            .GreaterThanOrEqualTo(0).WithMessage("Peso não pode ser negativo.");
    }
}
