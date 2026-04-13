# Ksense Healthcare API Assessment

## Overview

This project implements a patient risk scoring system using the DemoMed Healthcare API.

It fetches patient data, handles unreliable API conditions (rate limits, retries, pagination), computes risk scores, and submits the results.

---

## Features

- Resilient API integration with retry logic (429, 500, 503 handling)
- Pagination handling to fetch all patient records
- Robust data parsing for inconsistent/malformed API responses
- Risk scoring system based on:
  - Blood pressure
  - Temperature
  - Age
- Detection of:
  - High-risk patients (score ≥ 4)
  - Fever patients (≥ 99.6°F)
  - Data quality issues
- Submission of results via API

---

## Tech Stack

- React (Vite)
- TypeScript
- Fetch API

---

## How to Run

```bash
npm install
npm run dev
```
