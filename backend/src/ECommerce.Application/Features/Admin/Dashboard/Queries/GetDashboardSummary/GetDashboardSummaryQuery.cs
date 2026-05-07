using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Admin.Dashboard.Queries.GetDashboardSummary;

public record GetDashboardSummaryQuery(int DaysBack = 30) : IRequest<Result<DashboardSummaryDto>>;
