using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

public class HealthController : BaseController
{
    [HttpGet]
    public IActionResult Get()
        => Ok(new { status = "healthy", timestamp = DateTime.UtcNow, version = "1.0.0" });
}