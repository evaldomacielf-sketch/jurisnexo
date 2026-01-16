using System;
using System.Collections.Generic;

namespace JurisNexo.Application.DTOs.Analytics;

public class LeadMetricsDto
{
    // Volume
    public int TotalLeads { get; set; }
    public int NewLeads { get; set; }
    public int QualifiedLeads { get; set; }
    public int ConvertedLeads { get; set; }
    public int LostLeads { get; set; }
    
    // Taxa de Conversão (Percentage)
    public decimal ConversionRate { get; set; } 
    public decimal QualificationRate { get; set; }
    
    // Tempo
    public double AvgResponseTimeMinutes { get; set; }
    public double AvgConversionTimeDays { get; set; }
    
    // Qualidade
    public int HighQualityLeads { get; set; }
    public int MediumQualityLeads { get; set; }
    public int LowQualityLeads { get; set; }
    
    // Por Tipo de Caso
    public Dictionary<string, int> LeadsByCaseType { get; set; } = new();
    public Dictionary<string, decimal> ConversionRateByCaseType { get; set; } = new();
    
    // Por Fonte
    public Dictionary<string, int> LeadsBySource { get; set; } = new();
    
    // Por Advogado (Top performers / work distribution)
    public Dictionary<string, int> LeadsByAdvogado { get; set; } = new();
    public Dictionary<string, decimal> ConversionRateByAdvogado { get; set; } = new();
    
    // Tendências (comparação percentual com período anterior)
    public decimal LeadsTrend { get; set; } 
    public string LeadsTrendDirection { get; set; } = "up";
    public decimal ConversionTrend { get; set; }
    public string ConversionTrendDirection { get; set; } = "up";
    public decimal ResponseTimeTrend { get; set; }
    public string ResponseTimeTrendDirection { get; set; } = "down";

    // Construtor para inicialização padrão
    public LeadMetricsDto()
    {
        LeadsByCaseType = new Dictionary<string, int>();
        ConversionRateByCaseType = new Dictionary<string, decimal>();
        LeadsBySource = new Dictionary<string, int>();
        LeadsByAdvogado = new Dictionary<string, int>();
        ConversionRateByAdvogado = new Dictionary<string, decimal>();
    }
}
