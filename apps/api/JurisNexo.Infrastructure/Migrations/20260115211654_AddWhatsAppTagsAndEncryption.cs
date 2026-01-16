using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppTagsAndEncryption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WhatsAppConversation_TagsJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_TagsJson",
                table: "BaseEntity");
        }
    }
}
