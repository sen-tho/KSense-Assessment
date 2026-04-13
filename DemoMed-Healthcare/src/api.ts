import type { PatientsResponse, RawPatient, SubmissionPayload } from "./types";

const API_BASE = "https://assessment.ksensetech.com/api";
const API_KEY = import.meta.env.VITE_API_KEY;

if( !API_KEY) {
    throw new Error("Missing API_KEY in .env");
}

const sleep = ( ms: number ) => {
   return new Promise((resolve) => setTimeout(resolve, ms));
} 

export const fetchWithRetry = async(
    url: string,
    options?: RequestInit,
    maxAttempts = 5
) : Promise<Response> => {
    let lastError: unknown;

    for( let attempt = 1; attempt <= maxAttempts; attempt++ ) {
        try {
            const res = await fetch( url, options );

            if( res.ok ) {
                return res
            }

            const shouldRetry = 
            res.status === 429 || 
            res.status === 500 || 
            res.status === 503;

            if( !shouldRetry ) {
                throw new Error( `Request failed with status ${res.status}` );
            }

            lastError = new Error(`Retryable error: ${res.status}`);
        } 
        catch( error ) {
            lastError = error;
        }

        if( attempt < maxAttempts ) {
            const delay = 500 * Math.pow( 2, attempt - 1 );
            await sleep( delay );
        }
    }

    throw lastError instanceof Error
    ? lastError
    : new Error( "Request failed after retries");
};

export const fetchAllPatients = async() : Promise<RawPatient[]> => {
    const limit = 20;
    let page = 1;
    let hasNext = true;
    const allPatients: RawPatient[] = [];

    while( hasNext ) {
        const url = `${API_BASE}/patients?page=${page}&limit=${limit}`;

        const res = await fetchWithRetry(url, {
            method: "GET",
            headers: {
                "x-api-key": API_KEY,
            },
        });

        console.log(`Fetching page ${page}...`);

        const json: PatientsResponse = await res.json();

        const patients = Array.isArray( json.data ) ? json.data : [];
        allPatients.push(...patients);

        console.log(`Fetched page ${page}:`, patients.length);
        
        hasNext = Boolean(json.pagination?.hasNext);
        page += 1;

        if( hasNext ) {
            await sleep( 300 );
        }
    }

    return allPatients;
}

export const submitAssessment = async(
    payload: SubmissionPayload
): Promise<unknown> => {
    const res = await fetchWithRetry( `${API_BASE}/submit-assessment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
        },
        body: JSON.stringify(payload),
    });

    return await res.json();
}