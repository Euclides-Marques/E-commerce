using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ECommerce.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=ep-wandering-shadow-ajs70ngu.c-3.us-east-2.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_pqMVy5sz9nmr;SSL Mode=VerifyFull;Channel Binding=Require;",
            npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
        );
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
