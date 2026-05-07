using FluentValidation;

namespace ECommerce.Application.Features.Reviews.Commands.CreateProductReview;

public class CreateProductReviewCommandValidator : AbstractValidator<CreateProductReviewCommand>
{
    public CreateProductReviewCommandValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("A avaliação deve ser entre 1 e 5 estrelas.");

        RuleFor(x => x.Title)
            .MaximumLength(150).WithMessage("O título deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Comment)
            .MaximumLength(2000).WithMessage("O comentário deve ter no máximo 2000 caracteres.");
    }
}
