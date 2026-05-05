using AutoMapper;
using AutoMapper.QueryableExtensions;
using ECommerce.Application.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Common.Mappings;

public static class MappingExtensions
{
    public static Task<PaginatedList<TDestination>> PaginatedListAsync<TDestination>(
        this IQueryable<TDestination> queryable,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
        => PaginatedList<TDestination>.CreateAsync(queryable, pageNumber, pageSize, cancellationToken);

    public static Task<PaginatedList<TDestination>> ProjectToPagedListAsync<TSource, TDestination>(
        this IQueryable<TSource> queryable,
        IConfigurationProvider configuration,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
        => queryable
            .ProjectTo<TDestination>(configuration)
            .PaginatedListAsync(pageNumber, pageSize, cancellationToken);
}