using AutoMapper;
using ECommerce.Application.Features.Cart.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Features.Cart.Profiles;

public class CartProfile : Profile
{
    public CartProfile()
    {
        CreateMap<CartItem, CartItemDto>()
            .ConstructUsing((src, ctx) => new CartItemDto(
                src.ProductId,
                src.Product.Name,
                src.Product.Slug,
                src.Product.Images.FirstOrDefault(i => i.IsMain)?.Url ?? src.Product.Images.FirstOrDefault()?.Url,
                src.Product.GetDiscountedPrice(),
                src.Quantity,
                src.Product.GetDiscountedPrice() * src.Quantity
            ));
    }
}
