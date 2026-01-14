using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStageEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Order",
                table: "Stages",
                newName: "Position");

            migrationBuilder.RenameIndex(
                name: "IX_Stages_PipelineId_Order",
                table: "Stages",
                newName: "IX_Stages_PipelineId_Position");

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Stages",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DefaultProbability",
                table: "Stages",
                type: "integer",
                nullable: false,
                defaultValue: 50);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Stages",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsInitialStage",
                table: "Stages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLostStage",
                table: "Stages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsWonStage",
                table: "Stages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultProbability",
                table: "Stages");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Stages");

            migrationBuilder.DropColumn(
                name: "IsInitialStage",
                table: "Stages");

            migrationBuilder.DropColumn(
                name: "IsLostStage",
                table: "Stages");

            migrationBuilder.DropColumn(
                name: "IsWonStage",
                table: "Stages");

            migrationBuilder.RenameColumn(
                name: "Position",
                table: "Stages",
                newName: "Order");

            migrationBuilder.RenameIndex(
                name: "IX_Stages_PipelineId_Position",
                table: "Stages",
                newName: "IX_Stages_PipelineId_Order");

            migrationBuilder.AlterColumn<string>(
                name: "Color",
                table: "Stages",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);
        }
    }
}
