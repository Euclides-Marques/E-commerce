using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSellerRole_ReorderRoleValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Antes: Customer=1, Seller=2, Admin=3
            // Depois: Admin=1, Customer=2
            // 1. Admins (3) → valor temporário (99)
            // 2. Customers (1) e Sellers (2) → Customer novo (2)
            // 3. Temporário (99) → Admin novo (1)
            migrationBuilder.Sql(@"
                UPDATE ""Users"" SET ""Role"" = 99 WHERE ""Role"" = 3;
                UPDATE ""Users"" SET ""Role"" = 2 WHERE ""Role"" IN (1, 2);
                UPDATE ""Users"" SET ""Role"" = 1 WHERE ""Role"" = 99;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Reverter: Admin=1, Customer=2 → Customer=1, Admin=3
            migrationBuilder.Sql(@"
                UPDATE ""Users"" SET ""Role"" = 99 WHERE ""Role"" = 1;
                UPDATE ""Users"" SET ""Role"" = 1 WHERE ""Role"" = 2;
                UPDATE ""Users"" SET ""Role"" = 3 WHERE ""Role"" = 99;
            ");
        }
    }
}
