using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePipelineEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Pipelines",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Pipelines",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Position",
                table: "Pipelines",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PipelineId1",
                table: "Leads",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leads_PipelineId1",
                table: "Leads",
                column: "PipelineId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Leads_Pipelines_PipelineId1",
                table: "Leads",
                column: "PipelineId1",
                principalTable: "Pipelines",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Leads_Pipelines_PipelineId1",
                table: "Leads");

            migrationBuilder.DropIndex(
                name: "IX_Leads_PipelineId1",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "Pipelines");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Pipelines");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "Pipelines");

            migrationBuilder.DropColumn(
                name: "PipelineId1",
                table: "Leads");
        }
    }
}
