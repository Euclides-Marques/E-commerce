using AutoMapper;
using ECommerce.Application.Features.Categories.DTOs;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Features.Categories.Profiles;

public class CategoryProfile : Profile
{
    public CategoryProfile()
    {
        CreateMap<Category, CategoryDto>();
    }
}
