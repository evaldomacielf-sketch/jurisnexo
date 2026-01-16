using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JurisNexo.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppAndLeadRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Priority",
                table: "Leads",
                newName: "Urgency");

            migrationBuilder.RenameColumn(
                name: "WhatsAppMessage_MessageType",
                table: "BaseEntity",
                newName: "WhatsAppMessage_Type");

            migrationBuilder.AlterColumn<string>(
                name: "Tags",
                table: "Leads",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<Guid>(
                name: "StageId",
                table: "Leads",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<float>(
                name: "Probability",
                table: "Leads",
                type: "real",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<double>(
                name: "Position",
                table: "Leads",
                type: "double precision",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "PipelineId",
                table: "Leads",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "ContactId",
                table: "Leads",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedToUserName",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaseDescription",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CaseType",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConvertedAt",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FirstContactAt",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasExistingCase",
                table: "Leads",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "InteractionCount",
                table: "Leads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Leads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Leads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Quality",
                table: "Leads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ResponseTime",
                table: "Leads",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Score",
                table: "Leads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Leads",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AnswerText",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
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

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Body",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CriteriaJson",
                table: "BaseEntity",
                type: "text",
                nullable: true);

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
                name: "ExpectedResponseType",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FieldToMap",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FromStatus",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "BaseEntity",
                type: "boolean",
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
                name: "MediaType",
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

            migrationBuilder.AddColumn<string>(
                name: "RuleName",
                table: "BaseEntity",
                type: "text",
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
                name: "TargetUserId",
                table: "BaseEntity",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaskDescription",
                table: "BaseEntity",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Tenant_IsActive",
                table: "BaseEntity",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ToStatus",
                table: "BaseEntity",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TransitionedAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WhatsAppConversation_LastMessageAt",
                table: "BaseEntity",
                type: "timestamp with time zone",
                nullable: true);

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
                name: "IX_BaseEntity_QuestionId",
                table: "BaseEntity",
                column: "QuestionId");

            migrationBuilder.AddForeignKey(
                name: "FK_BaseEntity_BaseEntity_QuestionId",
                table: "BaseEntity",
                column: "QuestionId",
                principalTable: "BaseEntity",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaseEntity_BaseEntity_QuestionId",
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
                name: "IX_BaseEntity_QuestionId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "AssignedToUserName",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "CaseDescription",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "CaseType",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ConvertedAt",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "FirstContactAt",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "HasExistingCase",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "InteractionCount",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Quality",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ResponseTime",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "AnswerText",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AssignmentReason",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Body",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "CriteriaJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "DurationInPreviousStage",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ExpectedResponseType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FieldToMap",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "FromStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
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
                name: "MediaType",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "OptionsJson",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Order",
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
                name: "RuleName",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScoreValue",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ScoredAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TargetUserId",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TaskDescription",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "Tenant_IsActive",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "ToStatus",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "TransitionedAt",
                table: "BaseEntity");

            migrationBuilder.DropColumn(
                name: "WhatsAppConversation_LastMessageAt",
                table: "BaseEntity");

            migrationBuilder.RenameColumn(
                name: "Urgency",
                table: "Leads",
                newName: "Priority");

            migrationBuilder.RenameColumn(
                name: "WhatsAppMessage_Type",
                table: "BaseEntity",
                newName: "WhatsAppMessage_MessageType");

            migrationBuilder.AlterColumn<string>(
                name: "Tags",
                table: "Leads",
                type: "jsonb",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "StageId",
                table: "Leads",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Probability",
                table: "Leads",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(float),
                oldType: "real",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Position",
                table: "Leads",
                type: "integer",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double precision");

            migrationBuilder.AlterColumn<Guid>(
                name: "PipelineId",
                table: "Leads",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ContactId",
                table: "Leads",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
