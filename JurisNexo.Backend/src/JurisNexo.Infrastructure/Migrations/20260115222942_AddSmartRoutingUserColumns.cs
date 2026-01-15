using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSmartRoutingUserColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "AvgResponseTimeMinutes",
                table: "Users",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "ConversionRate",
                table: "Users",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "SpecializationsJson",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvgResponseTimeMinutes",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ConversionRate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SpecializationsJson",
                table: "Users");
        }
    }
}
