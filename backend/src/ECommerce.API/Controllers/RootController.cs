using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("")]
public class RootController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
        => Ok(new 
        { 
            message = "ECommerce API - Enterprise Platform",
            version = "1.0.0",
            documentation = "/swagger",
            health = "/health",
            timestamp = DateTime.UtcNow
        });
}
