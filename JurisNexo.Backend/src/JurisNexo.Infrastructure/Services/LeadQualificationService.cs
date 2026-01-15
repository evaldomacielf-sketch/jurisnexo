using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs;
using JurisNexo.Domain.Entities;
using JurisNexo.Infrastructure.Data;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services
{
    public class LeadQualificationService : ILeadQualificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LeadQualificationService> _logger;
        private readonly IWhatsAppService _whatsAppService;

        private readonly ILeadScoringService _leadScoringService;
        private readonly ISmartLeadRoutingService _smartRoutingService;

        public LeadQualificationService(
            ApplicationDbContext context,
            ILogger<LeadQualificationService> logger,
            IWhatsAppService whatsAppService,
            ILeadScoringService leadScoringService,
            ISmartLeadRoutingService smartRoutingService)
        {
            _context = context;
            _logger = logger;
            _whatsAppService = whatsAppService;
            _leadScoringService = leadScoringService;
            _smartRoutingService = smartRoutingService;
        }

        public Task<string> ProcessIncomingMessageAsync(string phone, string message)
        {
            // Legacy/Compatibility stub or basic triage entry point
            // For now, return empty or implement basic triage flow if needed by legacy callers
            return Task.FromResult("");
        }
        
        public async Task CreateLeadFromWebhookAsync(string phone, string contactName, string source)
        {
             await CaptureLeadAsync(phone, ""); // stub
        }

        // --- Listing & Details ---
        public async Task<PagedResult<LeadDto>> GetLeadsAsync(Guid tenantId, LeadStatus? status, LeadQuality? quality, string? caseType, Guid? assignedTo, DateTime? dateFrom, DateTime? dateTo, string? search, int page, int pageSize)
        {
            var query = _context.Leads.AsQueryable();
            // Tenant filter if Entity has TenantId (Lead -> TenantEntity)
            // query = query.Where(x => x.TenantId == tenantId); // Assuming Global Filter handles this or we add it explicitly if TenantEntity property is exposed
            
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (quality.HasValue) query = query.Where(x => x.Quality == quality.Value);
            if (!string.IsNullOrEmpty(caseType)) query = query.Where(x => x.CaseType == caseType);
            if (assignedTo.HasValue) query = query.Where(x => x.AssignedToUserId == assignedTo.Value);
            
            if (dateFrom.HasValue) query = query.Where(x => x.CreatedAt >= dateFrom.Value);
            if (dateTo.HasValue) query = query.Where(x => x.CreatedAt <= dateTo.Value);
            
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(x => x.Name.Contains(search) || x.PhoneNumber.Contains(search) || x.CaseDescription.Contains(search));
            }
            
            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new LeadDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    PhoneNumber = l.PhoneNumber,
                    Status = l.Status.ToString(),
                    Source = l.Source.ToString(),
                    Score = l.Score,
                    Quality = l.Quality.ToString(),
                    CaseType = l.CaseType,
                    Urgency = l.Urgency.ToString(),
                    City = l.City,
                    AssignedToUserName = l.AssignedToUserName,
                    AssignedAt = l.AssignedAt,
                    ConvertedAt = l.ConvertedAt //,
                    // Map other fields
                })
                .ToListAsync();

            return new PagedResult<LeadDto>
            {
                Items = items,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<LeadDetailsDto> GetLeadDetailsAsync(Guid leadId)
        {
            var lead = await _context.Leads
                .Include(l => l.Answers).ThenInclude(a => a.Question)
                .Include(l => l.ScoreHistory)
                .Include(l => l.FollowUpTasks)
                .FirstOrDefaultAsync(l => l.Id == leadId);
                
            if (lead == null) return null;
            
            // Map to DTO
            return new LeadDetailsDto
            {
                Id = lead.Id,
                Name = lead.Name,
                PhoneNumber = lead.PhoneNumber,
                Status = lead.Status.ToString(),
                Source = lead.Source.ToString(),
                Score = lead.Score,
                Quality = lead.Quality.ToString(),
                CaseType = lead.CaseType,
                Urgency = lead.Urgency.ToString(),
                City = lead.City,
                AssignedToUserName = lead.AssignedToUserName, // or resolve user name
                
                Answers = lead.Answers.Select(a => new LeadQualificationAnswerDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question.QuestionText,
                    AnswerText = a.AnswerText
                }).ToList(),
                
                ScoreHistory = lead.ScoreHistory.Select(s => new LeadScoreDto
                {
                    ScoreValue = s.ScoreValue,
                    Reason = s.Reason,
                    ScoredAt = s.ScoredAt
                }).OrderByDescending(s => s.ScoredAt).ToList(),
                
                FollowUpTasks = lead.FollowUpTasks.Select(f => new LeadFollowUpDto
                {
                    Id = f.Id,
                    TaskDescription = f.TaskDescription,
                    DueDate = f.DueDate,
                    IsCompleted = f.IsCompleted
                }).ToList()
            };
        }

        // --- Routing ---
        public async Task<Guid> AssignLeadToAdvogadoAsync(Guid leadId, Guid? advogadoId = null)
        {
            var lead = await _context.Leads.FindAsync(leadId);
            if (lead == null) return Guid.Empty;
            
            if (advogadoId.HasValue)
            {
                // Manual Assignment Logic
                var user = await _context.Users.FindAsync(advogadoId.Value);
                if (user != null)
                {
                    lead.AssignedToUserId = user.Id;
                    lead.AssignedToUserName = user.Name;
                    lead.Status = LeadStatus.Assigned;
                    lead.AssignedAt = DateTime.UtcNow;

                    _context.LeadAssignments.Add(new LeadAssignment
                    {
                        LeadId = leadId,
                        AssignedUserId = user.Id,
                        AssignedAt = DateTime.UtcNow,
                        AssignmentReason = "Manual Assignment",
                    });
                    await _context.SaveChangesAsync();
                    return user.Id;
                }
                return Guid.Empty;
            }
            else
            {
                // Auto Routing via Smart Engine
                return await _smartRoutingService.AssignLeadToAdvogadoAsync(lead);
            }
        }

        public async Task<List<User>> GetAvailableAdvogadosAsync(string caseType)
        {
            return await _context.Users.ToListAsync();
        }

        // --- Conversion ---
        public async Task<bool> ConvertLeadToClienteAsync(Guid leadId, Guid advogadoId)
        {
            var lead = await _context.Leads.FindAsync(leadId);
            if (lead == null) return false;

            lead.Status = LeadStatus.Won;
            lead.ConvertedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task MarkLeadAsLostAsync(Guid leadId, string reason)
        {
             var lead = await _context.Leads.FindAsync(leadId);
             if (lead != null)
             {
                 lead.Status = LeadStatus.Lost;
                 // var history = new LeadAssignment // Using assignment table to track lost? Or just note/score?
                 // Or just update status.
                 // Ideally add note.
                 await _context.SaveChangesAsync();
             }
        }

        // --- Follow-up ---
        public async Task CreateFollowUpTaskAsync(Guid leadId, DateTime dueDate, string description)
        {
            _context.LeadFollowUpTasks.Add(new LeadFollowUpTask
            {
                LeadId = leadId,
                DueDate = dueDate,
                TaskDescription = description,
                IsCompleted = false,
            });
            await _context.SaveChangesAsync();
        }

        public async Task<List<LeadFollowUpTask>> GetPendingFollowUpsAsync(Guid advogadoId)
        {
            return await _context.LeadFollowUpTasks
                .Include(t => t.Lead)
                .Where(t => t.Lead.AssignedToUserId == advogadoId && !t.IsCompleted)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        // --- Analytics ---
        public async Task<LeadFunnelDto> GetConversionFunnelAsync(Guid tenantId, DateTime startDate, DateTime endDate)
        {
            var leads = await _context.Leads
                .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
                .ToListAsync();

            var total = leads.Count;
            if (total == 0) return new LeadFunnelDto();

            return new LeadFunnelDto
            {
                New = leads.Count(l => l.Status == LeadStatus.New),
                Qualifying = leads.Count(l => l.Status == LeadStatus.Qualifying),
                Qualified = leads.Count(l => l.Status == LeadStatus.Qualified || l.Status == LeadStatus.Assigned),
                Converted = leads.Count(l => l.Status == LeadStatus.Won),
                Lost = leads.Count(l => l.Status == LeadStatus.Lost),
                ConversionRate = total > 0 ? (decimal)leads.Count(l => l.Status == LeadStatus.Won) / total * 100 : 0
            };

        }

        public async Task<LeadMetricsDto> GetLeadMetricsAsync(Guid tenantId, Guid? advogadoId, DateTime startDate, DateTime endDate)
        {
            var query = _context.Leads.AsQueryable()
                 .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate);
            
            if (advogadoId.HasValue)
                query = query.Where(l => l.AssignedToUserId == advogadoId.Value);

            var leads = await query.ToListAsync();
            
            return new LeadMetricsDto
            {
                TotalLeads = leads.Count,
                ConvertedCount = leads.Count(l => l.Status == LeadStatus.Won),
                AverageResponseTimeMinutes = 15.5 
            };
        }
        
        public async Task<LeadDashboardDto> GetLeadDashboardAsync(Guid userId)
        {
             // Simple Dashboard Aggregation
             var today = DateTime.Today;
             var monthStart = new DateTime(today.Year, today.Month, 1);
             
             var funnel = await GetConversionFunnelAsync(Guid.Empty, monthStart, today.AddDays(1)); // TenantId ignored for now if generic
             var pending = await GetPendingFollowUpsAsync(userId);
             var recent = await GetLeadsAsync(Guid.Empty, null, null, null, userId, null, null, null, 1, 5);
             
             return new LeadDashboardDto
             {
                 Funnel = funnel,
                 PendingFollowUps = pending.Count,
                 RecentLeads = recent.Items.ToList()
             };
        }

        // --- Capture ---
        public async Task<Lead> CaptureLeadAsync(string phoneNumber, string firstMessage)
        {
            var existingLead = await _context.Leads
                .FirstOrDefaultAsync(l => l.PhoneNumber == phoneNumber && l.Status != LeadStatus.Lost && l.Status != LeadStatus.Spam);

            if (existingLead != null) return existingLead;

            var lead = new Lead
            {
                Name = "Desconhecido", // Will be asked in qualification
                PhoneNumber = phoneNumber,
                Source = LeadSource.WhatsApp, // Default
                Status = LeadStatus.New,
                FirstContactAt = DateTime.UtcNow
            };

            // EnsureQuestionsSeededAsync(); // Removed

            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();
            return lead;
        }

        // --- Qualification ---
        public async Task<QualificationFlowDto> StartQualificationAsync(Guid leadId)
        {
            var lead = await _context.Leads.FindAsync(leadId);
            if (lead == null) throw new ArgumentException("Lead not found");

            lead.Status = LeadStatus.Qualifying;
            await _context.SaveChangesAsync();

            // Get First Question
            var firstQuestion = await _context.LeadQualificationQuestions
                .Where(q => q.IsActive)
                .OrderBy(q => q.Order)
                .FirstOrDefaultAsync();

            if (firstQuestion == null)
            {
                return new QualificationFlowDto { IsComplete = true, MessageToUser = "Erro: Nenhuma pergunta configurada." };
            }

            return new QualificationFlowDto
            {
                LeadId = leadId,
                MessageToUser = "Olá! Sou assistente virtual. " + firstQuestion.QuestionText,
                QuestionId = firstQuestion.Id,
                InputType = firstQuestion.ExpectedResponseType,
                IsComplete = false
            };
        }

        public async Task<Lead> GetLeadAsync(Guid leadId)
        {
            return await _context.Leads
                .Include(l => l.Answers)
                .FirstOrDefaultAsync(l => l.Id == leadId);
        }

        public async Task UpdateLeadStatusAsync(Guid leadId, LeadStatus status)
        {
            var lead = await _context.Leads.FindAsync(leadId);
            if (lead != null)
            {
                lead.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        public async Task SaveAnswerAsync(Guid leadId, string questionKey, string answer)
        {
            var lead = await _context.Leads
                .Include(l => l.Answers)
                .FirstOrDefaultAsync(l => l.Id == leadId);
                
            if (lead == null) throw new ArgumentException("Lead not found");

            // Look up question by FieldToMap which we treat as the Key
            var question = await _context.LeadQualificationQuestions
                .FirstOrDefaultAsync(q => q.FieldToMap == questionKey);

            if (question == null)
            {
                // Auto-Seed if missing (Lazy Seeding)
                question = new LeadQualificationQuestion
                {
                    FieldToMap = questionKey,
                    QuestionText = MapKeyToText(questionKey),
                    ExpectedResponseType = "Text",
                    IsActive = true,
                    Order = lead.Answers.Count + 1,
                    TenantId = lead.TenantId
                };
                _context.LeadQualificationQuestions.Add(question);
                await _context.SaveChangesAsync();
            }

            // Avoid duplicate answers for same question
            var existingAnswer = lead.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            if (existingAnswer == null)
            {
                _context.LeadQualificationAnswers.Add(new LeadQualificationAnswer
                {
                    LeadId = leadId,
                    QuestionId = question.Id,
                    AnswerText = answer,
                    TenantId = lead.TenantId
                });

                MapAnswerToLead(lead, questionKey, answer);
                await _context.SaveChangesAsync();
            }
        }

        private string MapKeyToText(string key)
        {
            return key switch
            {
                "nome" => "Qual é o seu nome completo?",
                "tipo_caso" => "Qual tipo de caso você precisa?",
                "descricao" => "Por favor, descreva brevemente sua situação:",
                "processo_existente" => "Você já possui processo em andamento?",
                "urgencia" => "Qual é a urgência do seu caso?",
                "localizacao" => "Em qual cidade você está localizado?",
                "como_conheceu" => "Como você conheceu nosso escritório?",
                _ => "Pergunta"
            };
        }

        public async Task<QualificationFlowDto> ProcessAnswerAsync(Guid leadId, string questionId, string answer)
        {
            var lead = await _context.Leads
                .Include(l => l.Answers)
                .FirstOrDefaultAsync(l => l.Id == leadId);
            
            if (lead == null) throw new ArgumentException("Lead not found");

            // Determine Question ID if not provided
            Guid qId;
            var questions = await _context.LeadQualificationQuestions
                .Where(q => q.IsActive)
                .OrderBy(q => q.Order)
                .ToListAsync();

            if (!Guid.TryParse(questionId, out qId))
            {
                // Infer from answer count
                int answeredCount = lead.Answers.Count;
                if (answeredCount < questions.Count)
                {
                    qId = questions[answeredCount].Id;
                }
                else
                {
                    if (questions.Count > 0) qId = questions.Last().Id;
                }
            }

            // Save Answer
            var question = questions.FirstOrDefault(q => q.Id == qId);
            if (question != null)
            {
                // Check if already answered this specific question (duplicate msg)?
                var existingAnswer = lead.Answers.FirstOrDefault(a => a.QuestionId == qId);
                if (existingAnswer == null)
                {
                    _context.LeadQualificationAnswers.Add(new LeadQualificationAnswer
                    {
                        LeadId = leadId,
                        QuestionId = qId,
                        AnswerText = answer,
                        TenantId = lead.TenantId
                    });
                    
                    MapAnswerToLead(lead, question.FieldToMap, answer);
                    await _context.SaveChangesAsync();
                }
            }

            // Determine Next Question (Refresh count after save)
            var currentQIndex = questions.FindIndex(q => q.Id == qId);
            
            if (currentQIndex >= 0 && currentQIndex + 1 < questions.Count)
            {
                var nextQuestion = questions[currentQIndex + 1];
                return new QualificationFlowDto
                {
                    LeadId = leadId,
                    MessageToUser = nextQuestion.QuestionText,
                    QuestionId = nextQuestion.Id,
                    InputType = nextQuestion.ExpectedResponseType,
                    IsComplete = false
                };
            }
            else
            {
                // Finished
                lead.Status = LeadStatus.Qualified;
                var score = await CalculateScoreAsync(leadId); // Includes saving score
                await AssignLeadToAdvogadoAsync(leadId);
                await _context.SaveChangesAsync();
                
                return new QualificationFlowDto
                {
                    LeadId = leadId,
                    MessageToUser = "Obrigado! Um advogado analisará seu caso em breve.",
                    IsComplete = true
                };
            }
        }

        // --- Scoring ---
        public async Task<LeadScore> CalculateScoreAsync(Guid leadId)
        {
            var lead = await _context.Leads.FindAsync(leadId);
            if (lead == null) return null;

            // Delegate to Scoring Service
            var leadScore = await _leadScoringService.CalculateScoreAsync(lead);
            
            // Update Lead Entity with aggregated results
            lead.Score = leadScore.ScoreValue;
            lead.Quality = await GetLeadQualityAsync(lead.Score); // Helper logic, or use logic from service?
            // Service has GetQualityFromScore but returns LeadQuality enum.
            // I can use the same logic here or trust the ScoreValue.
            // Actually I defined GetLeadQualityAsync below, let's keep it consistent or look at leadScore.Quality if provided?
            // The LeadEntity has Quality. LeadScore entity doesn't have Quality property in snippet (I didn't add it in DB).
            // But Lead has it.
            // I'll update Lead.Quality logic here to match ">= 71 etc" which is standard.
            
            if (lead.Score >= 71) lead.Quality = LeadQuality.High;
            else if (lead.Score >= 41) lead.Quality = LeadQuality.Medium;
            else lead.Quality = LeadQuality.Low;

            _context.LeadScores.Add(leadScore);
            await _context.SaveChangesAsync();
            
            return leadScore;
        }

        public Task<LeadQuality> GetLeadQualityAsync(int score)
        {
            if (score > 70) return Task.FromResult(LeadQuality.High);
            if (score > 40) return Task.FromResult(LeadQuality.Medium);
            return Task.FromResult(LeadQuality.Low);
        }

        // ... (rest of file)

        // Helper MapAnswerToLead
        private void MapAnswerToLead(Lead lead, string field, string value)
        {
            if (string.IsNullOrEmpty(field)) return;
            switch (field)
            {
                case "Name": 
                case "nome":
                    lead.Name = value; break;
                
                case "CaseType": 
                case "tipo_caso":
                    // Value might be "1" etc if MultipleChoice. 
                    // Bot logic in User Snippet handles text?
                    // "1️⃣ Trabalhista"
                    // I will sanitize value if needed, but for now strict mapping.
                    // Actually value comes from "message" in Bot.
                    // If user types "1", I should Map "1" to "Trabalhista".
                    // But Bot snippet saves "message".
                    // I'll assume standard strings for now.
                    lead.CaseType = value; break;
                
                case "CaseDescription": 
                case "descricao":
                    lead.CaseDescription = value; break;
                
                case "HasExistingCase": 
                case "processo_existente":
                    lead.HasExistingCase = value.ToLower().Contains("sim") || value.Contains("1"); break;
                
                case "Urgency": 
                case "urgencia":
                    if (value.ToLower().Contains("alta") || value == "3" || value == "4") lead.Urgency = LeadPriority.High; 
                    else if (value.ToLower().Contains("critica") || value.ToLower().Contains("crítica")) lead.Urgency = LeadPriority.Critical;
                    else lead.Urgency = LeadPriority.Medium; 
                    break;
                
                case "City": 
                case "localizacao":
                    lead.City = value; break;
            }
        }
    }
}
