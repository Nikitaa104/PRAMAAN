# PRAMAN (प्रमाण) • Regulatory Scrutiny & Approval System

> **All India Council for Technical Education (AICTE)**  
> *A Statutory Body of the Government of India*  
> Approval Process Handbook (APH 2026-27) Institutional Scrutiny & Evidentiary Verification Platform

---

## 🏛️ Overview

**PRAMAN (प्रमाण)** is an institutional, production-quality regulatory scrutiny portal designed for AICTE scrutiny officers, regional directors, and institutional representatives. It automates the intake, SHA-256 cryptographic hashing, multimodal OCR extraction, and deterministic rule validation of institutional approval dossiers (EoA, New Setup, Intake Increase).

Built with a strict **human-in-the-loop decision-support protocol**, PRAMAN ensures that AI assists in evidence collation while final regulatory determinations remain exclusively with authorized scrutiny officers.

---

## 🚀 Key Features

- **Institutional Operations Dashboard**: Real-time KPI metrics, dossier throughput tracking, deficiency distributions, and velocity analytics.
- **Dossier Master Register**: Filterable repository of institutional applications across states, categories, and scrutiny workflows.
- **Cryptographic Document Repository**: SHA-256 digest hashing with collision alerts for deed certificates, occupancy letters, and Fire NOCs.
- **AI Scrutiny Console**: 3-panel workspace providing page-cited OCR text streams, inline reviewer corrections with audit logging, and automated APH compliance checks.
- **Compliance Rules Engine**: Configurable rule matrix grounded in AICTE Approval Process Handbook (APH 2026-27) clauses.
- **Counter-Verification Queue**: Provenance verification queue for cross-referencing state registries and physical inspections.
- **Formal Scrutiny Reports**: Printable official letterhead dossiers with officer signature blocks and CSV export.
- **Immutable Audit Trail**: Chronological event logs with SHA-256 traceability for accountability and transparency.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Motion
- **Backend**: Node.js, Express, Multer, Tsx
- **AI / OCR Engine**: Google Gemini API (`@google/genai`) with deterministic fallback heuristics
- **Integrity**: SHA-256 cryptographic hashing

---

## 💻 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Nikitaa104/PRAMAAN.git
   cd PRAMAAN
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Optional: Add your `GEMINI_API_KEY` in `.env` to enable live multimodal document extraction)*

4. Launch the development server:
   ```bash
   npm run dev
   ```

5. Access the portal at:
   ```
   http://localhost:3000
   ```

---

## 📜 Statutory Notice

Automated scrutiny findings provide evidentiary assistance under AICTE APH regulations. Final regulatory decisions and approvals rest exclusively with appointed scrutiny officers.
