export type ParsedBP = {
    systolic: number | null;
    diastolic: number | null;
    valid: boolean;
};

export type PatientRiskResult = {
    patientId: string; 
    bpScore: number;
    tempScore: number;
    ageScore: number;
    totalRisk: number;
    hasFever: boolean;
    hasDataQualityIssue: boolean;
};