using AutoMapper;
using ECommerce.Application.Features.Products.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Features.Products.Profiles;

public class ProductProfile : Profile
{
    public ProductProfile()
    {
        CreateMap<ProductImage, ProductImageDto>();

        CreateMap<Product, ProductSummaryDto>()
            .ForMember(d => d.MainImageUrl, o => o.MapFrom(s =>
                s.Images.FirstOrDefault(i => i.IsMain) != null
                    ? s.Images.First(i => i.IsMain).Url
                    : s.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty));

        CreateMap<Product, ProductDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : string.Empty))
            .ForMember(d => d.Images, o => o.MapFrom(s => s.Images.OrderBy(i => i.DisplayOrder).ToList()));
    }
}
