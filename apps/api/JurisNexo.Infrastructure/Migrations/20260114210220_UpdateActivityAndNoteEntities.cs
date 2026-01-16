using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateActivityAndNoteEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPinned",
                table: "LeadNotes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActivityDate",
                table: "LeadActivities",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "LeadActivities",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "LeadActivities",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Metadata",
                table: "LeadActivities",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "LeadActivities",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_LeadActivities_CreatedByUserId",
                table: "LeadActivities",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_LeadActivities_Users_CreatedByUserId",
                table: "LeadActivities",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeadActivities_Users_CreatedByUserId",
                table: "LeadActivities");

            migrationBuilder.DropIndex(
                name: "IX_LeadActivities_CreatedByUserId",
                table: "LeadActivities");

            migrationBuilder.DropColumn(
                name: "IsPinned",
                table: "LeadNotes");

            migrationBuilder.DropColumn(
                name: "ActivityDate",
                table: "LeadActivities");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "LeadActivities");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "LeadActivities");

            migrationBuilder.DropColumn(
                name: "Metadata",
                table: "LeadActivities");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "LeadActivities");
        }
    }
}
