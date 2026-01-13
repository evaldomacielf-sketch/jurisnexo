export declare enum UrgencyLevel {
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    PLANTAO = "PLANTAO"
}
export declare class UrgencyService {
    private readonly KEYWORDS;
    classify(content: string): UrgencyLevel;
}
//# sourceMappingURL=urgency.service.d.ts.map