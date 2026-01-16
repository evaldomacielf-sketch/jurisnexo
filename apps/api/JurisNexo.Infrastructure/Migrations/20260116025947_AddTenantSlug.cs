using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_AppointmentId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_CaseEvent_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_MessageId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_Message_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_QuestionId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_ScheduledMessage_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_TenantId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_WhatsAppConversationId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_WhatsAppConversation_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Contacts_ClientId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Contacts_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Contacts_Conversation_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Contacts_WhatsAppContact_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Leads_LeadFollowUpTask_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Leads_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Leads_LeadQualificationAnswer_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Leads_LeadScore_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_CaseEvent_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_FromUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_ResponsibleLawyerId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_ScheduledMessage_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_ToUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_UploadedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_UserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_Users_WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_BaseEntity_TenantId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_LeadActivities_BaseEntity_TenantId",
                table: "LeadActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LeadNotes_BaseEntity_TenantId",
                table: "LeadNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_Leads_BaseEntity_TenantId",
                table: "Leads");

            migrationBuilder.DropForeignKey(
                name: "FK_Pipelines_BaseEntity_TenantId",
                table: "Pipelines");

            migrationBuilder.DropForeignKey(
                name: "FK_Stages_BaseEntity_TenantId",
                table: "Stages");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_BaseEntity_TenantId",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_BaseEntity",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_AppointmentId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_CaseEvent_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_CaseEvent_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ClientId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_Conversation_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_FromUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_LeadFollowUpTask_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_LeadQualificationAnswer_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_LeadScore_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_Message_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_MessageId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_QuestionId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_ResponsibleLawyerId",
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
                name: "IX_BaseEntity_UploadedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropIndex(
                name: "IX_BaseEntity_UserId",
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
                name: "Action",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AnswerText",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AppointmentId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignmentReason",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AuditLog_TenantId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "BlobStorageUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Body",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "BusinessCategory",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseEvent_CaseId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseEvent_CreatedBy",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseEvent_CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseEvent_Description",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseEvent_Title",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseEvent_Type",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CaseNumber",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Case_Description",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Case_Status",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Case_Title",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "City",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ComponentsJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ConfirmationResponse",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ConfirmedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ContactDocument_Name",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Content",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Conversation_ContactId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Conversation_Status",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CriteriaJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Details",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Direction",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Discriminator",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "DurationInPreviousStage",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EntityType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "EventDate",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ExpectedResponseType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ExpiresAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FieldToMap",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FirmName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FromStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FromUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarEventId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsBotEnabled",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsCritical",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsMuted",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsOnline",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsUrgent",
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
                name: "LastMessageAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LastSyncedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadConversionFunnel_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadFollowUpTask_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadQualificationAnswer_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadRoutingRule_IsActive",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadRoutingRule_Priority",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadScore_LeadId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LeadScore_Reason",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MediaType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MediaUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MeetLink",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MessageId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MessageTemplate_Content",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MessageTemplate_Name",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MessageType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Message_ConversationId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MetadataJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "MimeType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Name",
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
                name: "OptionsJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "PracticeArea",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ProfileName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ProviderMessageId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "QuestionId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "QuestionText",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "RequestConfirmation",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ResponsibleLawyerId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "RuleName",
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
                name: "ScoreValue",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScoredAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SenderType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SentAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SessionExpiresAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SessionStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "State",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "SyncStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TagsJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TargetUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TaskDescription",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Tenant_Email",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Tenant_IsActive",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ToStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ToUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TransferredAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TransitionedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TrialEndsAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UnreadCount",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UploadedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UploadedBy",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Url",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "UserId",
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
                name: "WhatsAppConversation_LastMessageAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_TagsJson",
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
                name: "WhatsAppMessage_MetadataJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_SentAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_Status",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppMessage_Type",
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

            migrationBuilder.DropColumn(
                name: "WhatsAppWebhookLog_ErrorMessage",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsappChatId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsappMessageId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ZipCode",
                table: "BaseEntity");

            migrationBuilder.RenameTable(
                name: "BaseEntity",
                newName: "WhatsAppWebhookLogs");

            migrationBuilder.RenameIndex(
                name: "IX_BaseEntity_TenantId",
                table: "WhatsAppWebhookLogs",
                newName: "IX_WhatsAppWebhookLogs_TenantId");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "WhatsAppWebhookLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "ReceivedAt",
                table: "WhatsAppWebhookLogs",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Provider",
                table: "WhatsAppWebhookLogs",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "Processed",
                table: "WhatsAppWebhookLogs",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Payload",
                table: "WhatsAppWebhookLogs",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EventType",
                table: "WhatsAppWebhookLogs",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_WhatsAppWebhookLogs",
                table: "WhatsAppWebhookLogs",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityType = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsCritical = table.Column<bool>(type: "boolean", nullable: false),
                    OldValue = table.Column<string>(type: "text", nullable: true),
                    NewValue = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ContactDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    MimeType = table.Column<string>(type: "text", nullable: false),
                    UploadedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactDocuments_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContactDocuments_Users_UploadedByUserId",
                        column: x => x.UploadedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirmName = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TrialEndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CaseNumber = table.Column<string>(type: "text", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PracticeArea = table.Column<string>(type: "text", nullable: true),
                    IsUrgent = table.Column<bool>(type: "boolean", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: true),
                    ResponsibleLawyerId = table.Column<Guid>(type: "uuid", nullable: true),
                    Tags = table.Column<List<string>>(type: "text[]", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cases_Contacts_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Cases_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Cases_Users_ResponsibleLawyerId",
                        column: x => x.ResponsibleLawyerId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnreadCount = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    AssignedToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    WhatsappChatId = table.Column<string>(type: "text", nullable: true),
                    LastMessageAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Conversations_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Conversations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Conversations_Users_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LeadAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AssignmentReason = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadAssignments_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadAssignments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadConversionFunnels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    TransitionedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DurationInPreviousStage = table.Column<TimeSpan>(type: "interval", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadConversionFunnels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadConversionFunnels_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadFollowUpTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskDescription = table.Column<string>(type: "text", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadFollowUpTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadFollowUpTasks_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadFollowUpTasks_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadQualificationQuestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    FieldToMap = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ExpectedResponseType = table.Column<string>(type: "text", nullable: false),
                    OptionsJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadQualificationQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadQualificationQuestions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadRoutingRules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleName = table.Column<string>(type: "text", nullable: false),
                    CriteriaJson = table.Column<string>(type: "text", nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadRoutingRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadRoutingRules_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadScores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScoreValue = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    ScoredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadScores_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadScores_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MessageTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageTemplates_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppContacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WhatsAppId = table.Column<string>(type: "text", nullable: false),
                    ProfileName = table.Column<string>(type: "text", nullable: true),
                    ProfilePictureUrl = table.Column<string>(type: "text", nullable: true),
                    SyncStatus = table.Column<string>(type: "text", nullable: true),
                    ContactId = table.Column<Guid>(type: "uuid", nullable: true),
                    TagsJson = table.Column<string>(type: "text", nullable: true),
                    BusinessCategory = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    LastSyncedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppContacts_Contacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "Contacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WhatsAppContacts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Body = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ExternalId = table.Column<string>(type: "text", nullable: true),
                    ComponentsJson = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppTemplates_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsOnline = table.Column<bool>(type: "boolean", nullable: false),
                    MeetLink = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: true),
                    CaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    GoogleCalendarEventId = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Appointments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Appointments_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CaseEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EventDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaseEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaseEvents_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CaseEvents_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppConversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WhatsAppId = table.Column<string>(type: "text", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    CustomerPhone = table.Column<string>(type: "text", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    SessionStatus = table.Column<int>(type: "integer", nullable: false),
                    LastCustomerMessageAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastMessageAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SessionExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AssignedToUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsBotEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastMessage = table.Column<string>(type: "text", nullable: true),
                    UnreadCount = table.Column<int>(type: "integer", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    IsMuted = table.Column<bool>(type: "boolean", nullable: false),
                    TagsJson = table.Column<string>(type: "text", nullable: true),
                    CaseId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppConversations_Cases_CaseId",
                        column: x => x.CaseId,
                        principalTable: "Cases",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WhatsAppConversations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WhatsAppConversations_Users_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderType = table.Column<int>(type: "integer", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    MessageType = table.Column<int>(type: "integer", nullable: false),
                    MediaUrl = table.Column<string>(type: "text", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WhatsappMessageId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Messages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeadQualificationAnswers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuestionId = table.Column<Guid>(type: "uuid", nullable: false),
                    AnswerText = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeadQualificationAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeadQualificationAnswers_LeadQualificationQuestions_Questio~",
                        column: x => x.QuestionId,
                        principalTable: "LeadQualificationQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadQualificationAnswers_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeadQualificationAnswers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentParticipants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppointmentParticipants_Appointments_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "Appointments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConversationTransfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FromUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ToUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    TransferredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConversationTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConversationTransfers_Users_FromUserId",
                        column: x => x.FromUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConversationTransfers_Users_ToUserId",
                        column: x => x.ToUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConversationTransfers_WhatsAppConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "WhatsAppConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ScheduledMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Message = table.Column<string>(type: "text", nullable: false),
                    ScheduledFor = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RequestConfirmation = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConfirmationResponse = table.Column<string>(type: "text", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    RetryCount = table.Column<int>(type: "integer", nullable: false),
                    NextRetryAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduledMessages_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ScheduledMessages_WhatsAppConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "WhatsAppConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WhatsAppConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    WhatsAppMessageId = table.Column<string>(type: "text", nullable: false),
                    ProviderMessageId = table.Column<string>(type: "text", nullable: false),
                    Direction = table.Column<int>(type: "integer", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    MediaUrl = table.Column<string>(type: "text", nullable: true),
                    MediaType = table.Column<string>(type: "text", nullable: true),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppMessages_WhatsAppConversations_WhatsAppConversation~",
                        column: x => x.WhatsAppConversationId,
                        principalTable: "WhatsAppConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WhatsAppMediaId = table.Column<string>(type: "text", nullable: false),
                    BlobStorageUrl = table.Column<string>(type: "text", nullable: false),
                    MimeType = table.Column<string>(type: "text", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: true),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MessageId = table.Column<Guid>(type: "uuid", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppMedia_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WhatsAppMedia_WhatsAppMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "WhatsAppMessages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppointmentParticipants_AppointmentId",
                table: "AppointmentParticipants",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CaseId",
                table: "Appointments",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_CreatedByUserId",
                table: "Appointments",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseEvents_CaseId",
                table: "CaseEvents",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_CaseEvents_CreatedByUserId",
                table: "CaseEvents",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_ClientId",
                table: "Cases",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_ResponsibleLawyerId",
                table: "Cases",
                column: "ResponsibleLawyerId");

            migrationBuilder.CreateIndex(
                name: "IX_Cases_TenantId",
                table: "Cases",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactDocuments_ContactId",
                table: "ContactDocuments",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactDocuments_UploadedByUserId",
                table: "ContactDocuments",
                column: "UploadedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_AssignedToUserId",
                table: "Conversations",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ContactId",
                table: "Conversations",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_TenantId",
                table: "Conversations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationTransfers_ConversationId",
                table: "ConversationTransfers",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationTransfers_FromUserId",
                table: "ConversationTransfers",
                column: "FromUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationTransfers_ToUserId",
                table: "ConversationTransfers",
                column: "ToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadAssignments_LeadId",
                table: "LeadAssignments",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadAssignments_TenantId",
                table: "LeadAssignments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadConversionFunnels_TenantId",
                table: "LeadConversionFunnels",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadFollowUpTasks_LeadId",
                table: "LeadFollowUpTasks",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadFollowUpTasks_TenantId",
                table: "LeadFollowUpTasks",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadQualificationAnswers_LeadId",
                table: "LeadQualificationAnswers",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadQualificationAnswers_QuestionId",
                table: "LeadQualificationAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadQualificationAnswers_TenantId",
                table: "LeadQualificationAnswers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadQualificationQuestions_TenantId",
                table: "LeadQualificationQuestions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadRoutingRules_TenantId",
                table: "LeadRoutingRules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadScores_LeadId",
                table: "LeadScores",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_LeadScores_TenantId",
                table: "LeadScores",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId",
                table: "Messages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageTemplates_TenantId",
                table: "MessageTemplates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMessages_ConversationId",
                table: "ScheduledMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledMessages_CreatedByUserId",
                table: "ScheduledMessages",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppContacts_ContactId",
                table: "WhatsAppContacts",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppContacts_TenantId",
                table: "WhatsAppContacts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppConversations_AssignedToUserId",
                table: "WhatsAppConversations",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppConversations_CaseId",
                table: "WhatsAppConversations",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppConversations_TenantId",
                table: "WhatsAppConversations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMedia_MessageId",
                table: "WhatsAppMedia",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMedia_TenantId",
                table: "WhatsAppMedia",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppMessages_WhatsAppConversationId",
                table: "WhatsAppMessages",
                column: "WhatsAppConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppTemplates_TenantId",
                table: "WhatsAppTemplates",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_Tenants_TenantId",
                table: "Contacts",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LeadActivities_Tenants_TenantId",
                table: "LeadActivities",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LeadNotes_Tenants_TenantId",
                table: "LeadNotes",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Leads_Tenants_TenantId",
                table: "Leads",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pipelines_Tenants_TenantId",
                table: "Pipelines",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Stages_Tenants_TenantId",
                table: "Stages",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Tenants_TenantId",
                table: "Users",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WhatsAppWebhookLogs_Tenants_TenantId",
                table: "WhatsAppWebhookLogs",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contacts_Tenants_TenantId",
                table: "Contacts");

            migrationBuilder.DropForeignKey(
                name: "FK_LeadActivities_Tenants_TenantId",
                table: "LeadActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_LeadNotes_Tenants_TenantId",
                table: "LeadNotes");

            migrationBuilder.DropForeignKey(
                name: "FK_Leads_Tenants_TenantId",
                table: "Leads");

            migrationBuilder.DropForeignKey(
                name: "FK_Pipelines_Tenants_TenantId",
                table: "Pipelines");

            migrationBuilder.DropForeignKey(
                name: "FK_Stages_Tenants_TenantId",
                table: "Stages");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Tenants_TenantId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_WhatsAppWebhookLogs_Tenants_TenantId",
                table: "WhatsAppWebhookLogs");

            migrationBuilder.DropTable(
                name: "AppointmentParticipants");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CaseEvents");

            migrationBuilder.DropTable(
                name: "ContactDocuments");

            migrationBuilder.DropTable(
                name: "ConversationTransfers");

            migrationBuilder.DropTable(
                name: "LeadAssignments");

            migrationBuilder.DropTable(
                name: "LeadConversionFunnels");

            migrationBuilder.DropTable(
                name: "LeadFollowUpTasks");

            migrationBuilder.DropTable(
                name: "LeadQualificationAnswers");

            migrationBuilder.DropTable(
                name: "LeadRoutingRules");

            migrationBuilder.DropTable(
                name: "LeadScores");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "MessageTemplates");

            migrationBuilder.DropTable(
                name: "ScheduledMessages");

            migrationBuilder.DropTable(
                name: "WhatsAppContacts");

            migrationBuilder.DropTable(
                name: "WhatsAppMedia");

            migrationBuilder.DropTable(
                name: "WhatsAppTemplates");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "LeadQualificationQuestions");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "WhatsAppMessages");

            migrationBuilder.DropTable(
                name: "WhatsAppConversations");

            migrationBuilder.DropTable(
                name: "Cases");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WhatsAppWebhookLogs",
                table: "WhatsAppWebhookLogs");

            migrationBuilder.RenameTable(
                name: "WhatsAppWebhookLogs",
                newName: "BaseEntity");

            migrationBuilder.RenameIndex(
                name: "IX_WhatsAppWebhookLogs_TenantId",
                table: "BaseEntity",
                newName: "IX_BaseEntity_TenantId");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ReceivedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Provider",
                table: "BaseEntity",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<bool>(
                name: "Processed",
                table: "BaseEntity",
                type: "boolean",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "boolean");

            migrationBuilder.AlterColumn<string>(
                name: "Payload",
                table: "BaseEntity",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "EventType",
                table: "BaseEntity",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AnswerText",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AppointmentId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedToUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignmentReason",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AuditLog_TenantId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BlobStorageUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Body",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BusinessCategory",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CaseEvent_CaseId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CaseEvent_CreatedBy",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CaseEvent_CreatedByUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaseEvent_Description",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaseEvent_Title",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CaseEvent_Type",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CaseId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaseNumber",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Case_Description",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Case_Status",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Case_Title",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClientId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComponentsJson",
                table: "BaseEntity",
                type: "text",
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
                name: "ContactDocument_Name",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ContactId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ConversationId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Conversation_ContactId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Conversation_Status",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CriteriaJson",
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

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Direction",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Discriminator",
                table: "BaseEntity",
                type: "character varying(34)",
                maxLength: 34,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "DurationInPreviousStage",
                table: "BaseEntity",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "BaseEntity",
                type: "timestamp with time zone",
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

            migrationBuilder.AddColumn<DateTime>(
                name: "EventDate",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExpectedResponseType",
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
                name: "FieldToMap",
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

            migrationBuilder.AddColumn<string>(
                name: "FirmName",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FromStatus",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FromUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarEventId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "BaseEntity",
                type: "boolean",
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
                name: "IsCompleted",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCritical",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMuted",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnline",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsUrgent",
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
                name: "LastMessageAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSyncedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadConversionFunnel_LeadId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadFollowUpTask_LeadId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadQualificationAnswer_LeadId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LeadRoutingRule_IsActive",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LeadRoutingRule_Priority",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LeadScore_LeadId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeadScore_Reason",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MediaType",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MediaUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MeetLink",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "MessageId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MessageTemplate_Content",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MessageTemplate_Name",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MessageType",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Message_ConversationId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetadataJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MimeType",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "BaseEntity",
                type: "text",
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

            migrationBuilder.AddColumn<string>(
                name: "OptionsJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PracticeArea",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "BaseEntity",
                type: "integer",
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
                name: "ProviderMessageId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "QuestionId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuestionText",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequestConfirmation",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ResponsibleLawyerId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RuleName",
                table: "BaseEntity",
                type: "text",
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

            migrationBuilder.AddColumn<int>(
                name: "ScoreValue",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScoredAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SenderId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SenderType",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SentAt",
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

            migrationBuilder.AddColumn<long>(
                name: "Size",
                table: "BaseEntity",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SyncStatus",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "Tags",
                table: "BaseEntity",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TagsJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TargetUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaskDescription",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tenant_Email",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Tenant_IsActive",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ToStatus",
                table: "BaseEntity",
                type: "integer",
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

            migrationBuilder.AddColumn<DateTime>(
                name: "TransitionedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialEndsAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UnreadCount",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UploadedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedBy",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedByUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Url",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "BaseEntity",
                type: "uuid",
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

            migrationBuilder.AddColumn<DateTime>(
                name: "WhatsAppConversation_LastMessageAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppConversation_TagsJson",
                table: "BaseEntity",
                type: "text",
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

            migrationBuilder.AddColumn<int>(
                name: "WhatsAppMessage_Type",
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

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppWebhookLog_ErrorMessage",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsappChatId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhatsappMessageId",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ZipCode",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_BaseEntity",
                table: "BaseEntity",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_AppointmentId",
                table: "BaseEntity",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_AssignedToUserId",
                table: "BaseEntity",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_CaseEvent_CaseId",
                table: "BaseEntity",
                column: "CaseEvent_CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_CaseEvent_CreatedByUserId",
                table: "BaseEntity",
                column: "CaseEvent_CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_CaseId",
                table: "BaseEntity",
                column: "CaseId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ClientId",
                table: "BaseEntity",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ContactId",
                table: "BaseEntity",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_Conversation_ContactId",
                table: "BaseEntity",
                column: "Conversation_ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ConversationId",
                table: "BaseEntity",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_CreatedByUserId",
                table: "BaseEntity",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_FromUserId",
                table: "BaseEntity",
                column: "FromUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_LeadFollowUpTask_LeadId",
                table: "BaseEntity",
                column: "LeadFollowUpTask_LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_LeadId",
                table: "BaseEntity",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_LeadQualificationAnswer_LeadId",
                table: "BaseEntity",
                column: "LeadQualificationAnswer_LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_LeadScore_LeadId",
                table: "BaseEntity",
                column: "LeadScore_LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_Message_ConversationId",
                table: "BaseEntity",
                column: "Message_ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_MessageId",
                table: "BaseEntity",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_QuestionId",
                table: "BaseEntity",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_ResponsibleLawyerId",
                table: "BaseEntity",
                column: "ResponsibleLawyerId");

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
                name: "IX_BaseEntity_UploadedByUserId",
                table: "BaseEntity",
                column: "UploadedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BaseEntity_UserId",
                table: "BaseEntity",
                column: "UserId");

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
                name: "FK_BaseEntity_BaseEntity_AppointmentId",
                table: "BaseEntity",
                column: "AppointmentId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_CaseEvent_CaseId",
                table: "BaseEntity",
                column: "CaseEvent_CaseId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_CaseId",
                table: "BaseEntity",
                column: "CaseId",
                principalTable: "BaseEntity",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_ConversationId",
                table: "BaseEntity",
                column: "ConversationId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_MessageId",
                table: "BaseEntity",
                column: "MessageId",
                principalTable: "BaseEntity",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_Message_ConversationId",
                table: "BaseEntity",
                column: "Message_ConversationId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_QuestionId",
                table: "BaseEntity",
                column: "QuestionId",
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
                name: "FK_BaseEntity_BaseEntity_TenantId",
                table: "BaseEntity",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_BaseEntity_Contacts_ClientId",
                table: "BaseEntity",
                column: "ClientId",
                principalTable: "Contacts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Contacts_ContactId",
                table: "BaseEntity",
                column: "ContactId",
                principalTable: "Contacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Contacts_Conversation_ContactId",
                table: "BaseEntity",
                column: "Conversation_ContactId",
                principalTable: "Contacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Contacts_WhatsAppContact_ContactId",
                table: "BaseEntity",
                column: "WhatsAppContact_ContactId",
                principalTable: "Contacts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Leads_LeadFollowUpTask_LeadId",
                table: "BaseEntity",
                column: "LeadFollowUpTask_LeadId",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Leads_LeadId",
                table: "BaseEntity",
                column: "LeadId",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Leads_LeadQualificationAnswer_LeadId",
                table: "BaseEntity",
                column: "LeadQualificationAnswer_LeadId",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Leads_LeadScore_LeadId",
                table: "BaseEntity",
                column: "LeadScore_LeadId",
                principalTable: "Leads",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_AssignedToUserId",
                table: "BaseEntity",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_CaseEvent_CreatedByUserId",
                table: "BaseEntity",
                column: "CaseEvent_CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_CreatedByUserId",
                table: "BaseEntity",
                column: "CreatedByUserId",
                principalTable: "Users",
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
                name: "FK_BaseEntity_Users_ResponsibleLawyerId",
                table: "BaseEntity",
                column: "ResponsibleLawyerId",
                principalTable: "Users",
                principalColumn: "Id");

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
                name: "FK_BaseEntity_Users_UploadedByUserId",
                table: "BaseEntity",
                column: "UploadedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_UserId",
                table: "BaseEntity",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_Users_WhatsAppConversation_AssignedToUserId",
                table: "BaseEntity",
                column: "WhatsAppConversation_AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Contacts_BaseEntity_TenantId",
                table: "Contacts",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LeadActivities_BaseEntity_TenantId",
                table: "LeadActivities",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LeadNotes_BaseEntity_TenantId",
                table: "LeadNotes",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Leads_BaseEntity_TenantId",
                table: "Leads",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pipelines_BaseEntity_TenantId",
                table: "Pipelines",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Stages_BaseEntity_TenantId",
                table: "Stages",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_BaseEntity_TenantId",
                table: "Users",
                column: "TenantId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
