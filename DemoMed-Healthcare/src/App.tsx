import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchAllPatients, submitAssessment } from './api'
import type { RawPatient, SubmissionPayload } from './types';
import { buildSubmissionPayload, evaluatePatientRisk } from "./utils/risk";

function App() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patients, setPatients] = useState<RawPatient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SubmissionPayload | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);


  
  const handleLoadPatients = async() => {
    setLoading(true);
    setError(null);
    setSubmitResult(null);

    try {
      const data = await fetchAllPatients();
      const builtPayload = buildSubmissionPayload(data);

      setPatients(data);
      setPayload(builtPayload);
    } 
    catch( error ) { 
      console.error(error);
      setError("Failed to fetch patients");
    }
    finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!payload) {
      setError("Load patients first before submitting");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitAssessment(payload);
      setSubmitResult(result);
      console.log("SUBMIT RESULT:", result);
    } catch (err) {
      console.error(err);
      setError("Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };


  return (
  <div style={{padding: "20px", fontFamily: "sans-serif" }}>
    <h1> DemoMed - HealthCare</h1>
    <div style={ { display: "flex", gap: "12px", marginBottom: "20px" }}>
      <button 
        onClick={handleLoadPatients}
        disabled={loading}
        style={{
          padding: "10px 16px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
        >
          {loading ? "Loading..." : "Load Patients"}
      </button>

      <button
        onClick={handleSubmitAssessment}
        disabled={!payload || loading || submitting}
        style={{
          padding: "10px 16px",
          cursor:
            !payload || loading || submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : "Submit Assessment"}
      </button>
    </div>

    {error && <p style={{ color: "red" }}>{error}</p>}

    {patients.length > 0 && payload && (
      <div>
        <h3>Total Patients: {patients.length}</h3>
        <p>High Risk Count: {payload.high_risk_patients.length}</p>
        <p>Fever Count: {payload.fever_patients.length}</p>
        <p>Data Quality Count: {payload.data_quality_issues.length}</p>

        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          {patients.map((p) => (
            <div key={p.patient_id}>
                {p.patient_id} - {p.name}
              </div>
          ))}
        </div>
      </div>
    )}

    {submitResult && (
        <div style={{ marginTop: "20px" }}>
          <h3>Submission Result</h3>
          <pre
            style={{
              background: "#f4f4f4",
              border: "1px solid #ddd",
              padding: "12px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(submitResult, null, 2)}
          </pre>
        </div>
      )}      
  </div>
  );
}

export default App
