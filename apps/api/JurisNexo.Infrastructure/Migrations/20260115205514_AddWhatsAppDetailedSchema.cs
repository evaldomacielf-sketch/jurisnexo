using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppDetailedSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlobStorageUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BusinessCategory",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComponentsJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Direction",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ErrorMessage",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventType",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "BaseEntity",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBotEnabled",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMuted",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastCustomerMessageAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastMessage",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MessageId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetadataJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Payload",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Processed",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileName",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReceivedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SessionExpiresAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionStatus",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SyncStatus",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TagsJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UploadedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WhatsAppContact_ContactId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppContact_Description",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WhatsAppConversationId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "WhatsAppConversation_CaseId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WhatsAppConversation_UnreadCount",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppConversation_WhatsAppId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppMediaId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppMedia_MimeType",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppMessageId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppMessage_Content",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppMessage_MediaUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WhatsAppMessage_MessageType",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppMessage_MetadataJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WhatsAppMessage_SentAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WhatsAppMessage_Status",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppTemplate_Category",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppTemplate_Content",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppTemplate_Name",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WhatsAppTemplate_Status",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_MessageId",
                table: "BaseEntity",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_WhatsAppContact_ContactId",
                table: "BaseEntity",
                column: "WhatsAppContact_ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity",
                column: "WhatsAppConversation_AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_WhatsAppConversation_CaseId",
                table: "BaseEntity",
                column: "WhatsAppConversation_CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_WhatsAppConversationId",
                table: "BaseEntity",
                column: "WhatsAppConversationId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_MessageId",
                table: "BaseEntity",
                column: "MessageId",
                principalTable: "BaseEntity",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_WhatsAppConversationId",
                table: "BaseEntity",
                column: "WhatsAppConversationId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_WhatsAppConversation_CaseId",
                table: "BaseEntity",
                column: "WhatsAppConversation_CaseId",
                principalTable: "BaseEntity",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Contacts_WhatsAppContact_ContactId",
                table: "BaseEntity",
                column: "WhatsAppContact_ContactId",
                principalTable: "Contacts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity",
                column: "WhatsAppConversation_AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_MessageId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_WhatsAppConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_WhatsAppConversation_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Contacts_WhatsAppContact_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_MessageId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_WhatsAppContact_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_WhatsAppConversation_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_WhatsAppConversationId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "BlobStorageUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "BusinessCategory",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ComponentsJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Direction",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ErrorMessage",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EventType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsBotEnabled",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsMuted",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LastCustomerMessageAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LastMessage",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LastSyncedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MessageId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MetadataJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Payload",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Processed",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ProfileName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ReceivedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SessionExpiresAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SessionStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SyncStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TagsJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UploadedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppContact_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppContact_Description",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversationId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_UnreadCount",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_WhatsAppId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMediaId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMedia_MimeType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessageId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_Content",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_MediaUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_MessageType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_MetadataJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_SentAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_Status",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppTemplate_Category",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppTemplate_Content",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppTemplate_Name",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppTemplate_Status",
                table: "BaseEntity");
        }
    }
}
