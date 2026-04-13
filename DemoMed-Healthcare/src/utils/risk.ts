import type { RawPatient, SubmissionPayload } from "../types";

type ParsedBP = {
    systolic: number | null;
    diastolic: number | null;
    valid: boolean;
};

type PatientRiskResult = {
    patientId: string; 
    bpScore: number;
    tempScore: number;
    ageScore: number;
    totalRisk: number;
    hasFever: boolean;
    hasDataQualityIssue: boolean;
};

const parseNumber = (value: unknown): number | null => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
};

const parseBloodPressure = (value: unknown): ParsedBP => {
  if (typeof value !== "string" || value.trim() === "") {
    return { systolic: null, diastolic: null, valid: false };
  }

  const parts = value.split("/");

  if (parts.length !== 2) {
    return { systolic: null, diastolic: null, valid: false };
  }

  const systolic = parseNumber(parts[0].trim());
  const diastolic = parseNumber(parts[1].trim());

  if (systolic === null || diastolic === null) {
    return { systolic: null, diastolic: null, valid: false };
  }

  return {
    systolic,
    diastolic,
    valid: true,
  };
};

const getBloodPressureScore = (bp: ParsedBP): number => {
  if (!bp.valid || bp.systolic === null || bp.diastolic === null) {
    return 0;
  }

  const { systolic, diastolic } = bp;

  if (systolic < 120 && diastolic < 80) {
    return 1;
  }

  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 2;
  }

  if (systolic >= 140 || diastolic >= 90) {
    return 4;
  }

  if (systolic >= 130 || diastolic >= 80) {
    return 3;
  }

  return 0;
};

const getTemperatureScore = (temp: number | null): number => {
  if (temp === null) {
    return 0;
  }

  if (temp <= 99.5) {
    return 0;
  }

  if (temp >= 99.6 && temp <= 100.9) {
    return 1;
  }

  if (temp >= 101.0) {
    return 2;
  }

  return 0;
};

const getAgeScore = (age: number | null): number => {
  if (age === null) {
    return 0;
  }

  if (age > 65) {
    return 2;
  }

  return 1;
};

export const evaluatePatientRisk = (patient: RawPatient): PatientRiskResult => {
  const patientId = patient.patient_id ?? "";

  const parsedBP = parseBloodPressure(patient.blood_pressure);
  const parsedTemp = parseNumber(patient.temperature);
  const parsedAge = parseNumber(patient.age);

  const bpScore = getBloodPressureScore(parsedBP);
  const tempScore = getTemperatureScore(parsedTemp);
  const ageScore = getAgeScore(parsedAge);

  const hasDataQualityIssue =
    !parsedBP.valid || parsedTemp === null || parsedAge === null;

  const hasFever = parsedTemp !== null && parsedTemp >= 99.6;

  return {
    patientId,
    bpScore,
    tempScore,
    ageScore,
    totalRisk: bpScore + tempScore + ageScore,
    hasFever,
    hasDataQualityIssue,
  };
};

export const buildSubmissionPayload = (
  patients: RawPatient[]
): SubmissionPayload => {
  const highRiskPatients = new Set<string>();
  const feverPatients = new Set<string>();
  const dataQualityIssues = new Set<string>();

  for (const patient of patients) {
    const result = evaluatePatientRisk(patient);

    if (!result.patientId) {
      continue;
    }

    if (result.totalRisk >= 4) {
      highRiskPatients.add(result.patientId);
    }

    if (result.hasFever) {
      feverPatients.add(result.patientId);
    }

    if (result.hasDataQualityIssue) {
      dataQualityIssues.add(result.patientId);
    }
  }

  return {
    high_risk_patients: Array.from(highRiskPatients).sort(),
    fever_patients: Array.from(feverPatients).sort(),
    data_quality_issues: Array.from(dataQualityIssues).sort(),
  };
};