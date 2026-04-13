import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchAllPatients } from './api'
import type { RawPatient } from './types';
import { buildSubmissionPayload } from "./utils/risk";

function App() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<RawPatient[]>([]);
  const [error, setError] = useState<string | null>(null)
  
  const handleLoadPatients = async() => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAllPatients();
      const payload = buildSubmissionPayload(data);

      setPatients(data);

      console.log("ALL PATIENTS", data);
      console.log("COUNT:", data.length);  
      console.log("SUBMISSION PAYLOAD:", payload);
      console.log("HIGH RISK COUNT:", payload.high_risk_patients.length);
      console.log("FEVER COUNT:", payload.fever_patients.length);
      console.log("DATA QUALITY COUNT:", payload.data_quality_issues.length);
    } 
    catch( error ) { 
      console.error(error);
      setError("Failed to fetch patients");
    }
    finally {
      setLoading(false);
    }
  };

  return (
  <div style={{padding: "20px", fontFamily: "sans-serif" }}>
    <h1> DemoMed - HealthCare</h1>
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

    {error && <p style={{ color: "red" }}>{error}</p>}

    {patients.length > 0 && (
      <div>
        <h3>Total Patients: {patients.length}</h3>

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



      
  </div>
  )
}

export default App
