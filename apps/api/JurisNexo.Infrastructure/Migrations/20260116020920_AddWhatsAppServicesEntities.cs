using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppServicesEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ConsentDeniedAt",
                table: "Contacts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsentGrantedAt",
                table: "Contacts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsentRequestedAt",
                table: "Contacts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsentRevokedAt",
                table: "Contacts",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConsentStatus",
                table: "Contacts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AuditLog_TenantId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConfirmationResponse",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityType",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FromUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCritical",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeadScore_Reason",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Message_ConversationId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NewValue",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextRetryAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OldValue",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequestConfirmation",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledFor",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ScheduledMessage_ConversationId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ScheduledMessage_CreatedByUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ScheduledMessage_Notes",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledMessage_SentAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ScheduledMessage_Status",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ToUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TransferredAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppWebhookLog_ErrorMessage",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_FromUserId",
                table: "BaseEntity",
                column: "FromUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_Message_ConversationId",
                table: "BaseEntity",
                column: "Message_ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ScheduledMessage_ConversationId",
                table: "BaseEntity",
                column: "ScheduledMessage_ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ScheduledMessage_CreatedByUserId",
                table: "BaseEntity",
                column: "ScheduledMessage_CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ToUserId",
                table: "BaseEntity",
                column: "ToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_UserId",
                table: "BaseEntity",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_Message_ConversationId",
                table: "BaseEntity",
                column: "Message_ConversationId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_ScheduledMessage_ConversationId",
                table: "BaseEntity",
                column: "ScheduledMessage_ConversationId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_FromUserId",
                table: "BaseEntity",
                column: "FromUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_ScheduledMessage_CreatedByUserId",
                table: "BaseEntity",
                column: "ScheduledMessage_CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_ToUserId",
                table: "BaseEntity",
                column: "ToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_UserId",
                table: "BaseEntity",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_Message_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_ScheduledMessage_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_FromUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_ScheduledMessage_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_ToUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_UserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_FromUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_Message_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ScheduledMessage_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ScheduledMessage_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ToUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_UserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ConsentDeniedAt",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "ConsentGrantedAt",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "ConsentRequestedAt",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "ConsentRevokedAt",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "ConsentStatus",
                table: "Contacts");

            migrationBuilder.DropColumn(
                name: "Action",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AuditLog_TenantId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ConfirmationResponse",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Details",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EntityType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FromUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsCritical",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadScore_Reason",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Message_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "NewValue",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "NextRetryAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "OldValue",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "RequestConfirmation",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScheduledFor",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScheduledMessage_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScheduledMessage_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScheduledMessage_Notes",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScheduledMessage_SentAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScheduledMessage_Status",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ToUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TransferredAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppWebhookLog_ErrorMessage",
                table: "BaseEntity");
        }
    }
}
