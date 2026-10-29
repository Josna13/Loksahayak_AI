# LOKORITHM — AI-Powered Citizen Services and Smart Governance

> **One Platform. Smarter Services. Transparent Governance.**  
> *Innovation Challenge Prototype — Demonstration Only*  
> **Submission for Seva Innovation Challenge 2026**  
> **Category:** Women Category  
> **Sector:** Emerging Technologies — AI, Blockchain and Others  
> **Sub-theme:** AI-powered citizen services and smart governance  
> **Initial Geographic Focus:** Maharashtra, India  
> **Supported Interface Languages:** English, मराठी (Marathi), हिन्दी (Hindi)  

---

## 🏛️ Executive Summary

**LOKORITHM** is a government-grade digital public services prototype engineered to streamline citizen interactions with state and central welfare mechanisms, demystify statutory certificates, and provide transparent public grievance redressal with automated AI classification.

Designed with a high emphasis on the **Women Category** and citizen empowerment in Maharashtra, LOKORITHM bridges the gap between complex administrative procedures and everyday citizens through explainable AI, multilingual voice/text assistance, and preliminary document verification.

> **Responsible AI Notice:** LOKORITHM is an innovation challenge prototype built for demonstration and evaluation. It is not an official government portal. AI outputs are advisory and grounded in public knowledge references; all sensitive decisions, statutory sanctions, and complaint resolutions remain strictly with certified human officers.

---

## 🚀 Key Modules & Architecture

### 1. Home / Citizen Portal (`/`)
- Public-service entry point featuring an official government aesthetic (Indian tricolor subtle accent, deep navy `#183153`, government green `#176B45`, and saffron orange `#E98A24`).
- Interactive Voice/Text Assistant preview simulator with demo microphone wave and multilingual prompt switches.
- 6 Quick Service cards linking to Schemes, Documents, Grievances, Tracking, Guidance, and Public Bulletins.
- Spotlight on Maharashtra's **Women Welfare Initiatives** (*Mukhyamantri Majhi Ladki Bahin Yojana*, *Lek Ladki Yojana*, *PM MUDRA*).
- Transparency, data privacy, and human-in-the-loop guarantee badges.

### 2. AI Citizen Assistant (`/assistant`)
- Multilingual conversational helpdesk supporting English, Marathi, and Hindi.
- Grounded Retrieval-Augmented Generation (RAG) knowledge base over published Maharashtra government portals (*Aaple Sarkar*, *WCD Maharashtra*, *MahaDBT*).
- Suggested questions for one-click citizen inquiries.
- **Interactive Document Checklist Generator:** Citizens can check off required certificates directly in the chat.
- Official source verification links with verification indicators.
- Voice input simulator with speech synthesis states.

### 3. Smart Government Scheme Finder (`/schemes`)
- Multi-attribute eligibility filtering:
  - Geographic District (36 Maharashtra districts: Pune, Mumbai, Thane, Nagpur, Nashik, etc.)
  - Beneficiary Category (Women Welfare focus, Social Welfare, Education, Entrepreneurship, Housing)
  - Applicant Age slider (0 to 80+ years)
  - Occupation / Profile (Students, SHG entrepreneurs, Farmers, Homemakers)
  - Annual Family Income ceiling
- **Explainable Matching Engine:** Every scheme card features a *"Why this matches your profile"* badge explaining the exact criteria that triggered the match.
- Detail drawer with complete eligibility rules, required documents list, and direct links to official state application portals.

### 4. Intelligent Grievance Management (`/grievance`)
- **Filing Workflow:**
  - Client-side and server-side validation.
  - Category, District, Locality, Title, Detailed Description.
  - Optional site photograph upload with file-size & MIME checks (<5MB).
  - Consent checkbox for demonstration evaluation.
- **Real-time AI Assistant Panel:**
  - Predicts Urgency Priority (`High`, `Medium`, `Low`) based on safety and health hazard keywords.
  - Automatically recommends responsible department (*PWD Maharashtra*, *MJP Water Works*, *BMC SWM*, *MSEDCL*).
  - **Duplicate Detection Engine:** Checks active complaints in the same locality and alerts citizens of co-located issues.
- **Transparent Tracking View:**
  - Searchable by Reference ID (e.g., `LOKO-DEMO-1001` to `LOKO-DEMO-1005` or newly filed tickets).
  - 5-step visual progression timeline: *Submitted* ➔ *Under Review* ➔ *Assigned* ➔ *In Progress* ➔ *Resolved*.
  - Activity log with officer timestamps and administrative remarks.

### 5. Document Assistance and Verification (`/documents`)
- Pre-scrutiny tool for government certificates (*Income Certificate*, *Domicile/Residence Certificate*, *Caste Certificate*, *Ration Card*, *Land 7/12*).
- Drag-and-drop file upload with pre-configured sample files for 1-click evaluator testing.
- Simulated/real OCR extraction preview (Certificate Number, Applicant Name, Authority, Validity Period).
- Automated completeness checklist (identifies missing seals, signatures, or expired dates).
- Prominent regulatory disclaimer: *"This is an automated preliminary check. An authorized person must review any flagged issue."*

### 6. Government Officer Dashboard (`/officer-dashboard`)
- Administrative case-management system for municipal and taluka-level officers.
- Top KPI summary cards: Total Complaints, Pending Scrutiny, In Progress, Resolved, and Approaching SLA Deadline.
- Filterable, searchable, sortable complaint table.
- **Administrative Action Drawer:**
  - Change case status (*Under Review*, *Assigned*, *In Progress*, *Resolved*).
  - Reassign responsible municipal department.
  - Override priority.
  - Append internal timestamped officer notes to the audit trail.
- Database reset tool for testing and evaluation.

### 7. Predictive Governance Analytics (`/analytics`)
- Executive dashboard visualizing municipal data using interactive **Recharts**:
  - Complaints by Category (Bar Chart).
  - Case Resolution Status (Donut / Pie Chart).
  - 7-Day Inflow vs Resolution Velocity (Area Chart).
  - District-wise Grievance Density across Maharashtra (Horizontal Bar Chart).
- **Key AI Observations Panel:** Summarizes data insights (e.g., water supply hotspot detection in Pune Haveli, PWD road maintenance volume in Thane).
- Future roadmap indicator: *"Future capability — requires adequate historical baseline."*

### 8. Scheme and Service Administration (`/admin`)
- Administrative interface for managing reference knowledge and statutory guidelines.
- Table of published services, SLA turnaround days, and source gazettes.
- Form to add new reference records.
- Toggle record status (*Published*, *Draft*, *Needs Review*).
- RAG Vector Index synchronization monitor.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, Python-Multipart |
| **Database** | SQLite3 (`lokorithm.db`) with pre-seeded Maharashtra government records |
| **AI & NLP** | RAG grounding engine, keyword heuristic priority triage, OCR simulation engine, optional Gemini API integration |
| **Design System** | Accessible Indian public portal UI (`#183153` Navy, `#176B45` Green, `#E98A24` Saffron) |

---

## 💻 Local Setup & Execution Instructions

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Josna13/Loksahayak_AI.git
cd Loksahayak_AI
```

### 2. Backend Setup (FastAPI & SQLite)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Initialize and seed database
python database.py

# Start the FastAPI server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*The backend API will be live at `http://127.0.0.1:8000` (API Docs at `/docs`).*

### 3. Frontend Setup (React & Vite)
Open a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install

# Start the Vite development server
npm run dev
```
*The frontend web application will be live at `http://localhost:5173`.*

> **Offline / Resilient Mode:** The frontend includes an integrated local storage fallback. If the backend is ever offline, all features (Scheme discovery, Grievance filing, Timeline tracking, Document OCR preview, and Officer case actions) continue functioning seamlessly!

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:
```env
# Optional: Google Gemini API Key for dynamic LLM generation
GEMINI_API_KEY=your_gemini_api_key_here

# Backend settings
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
VITE_API_URL=http://127.0.0.1:8000
```

---

## 📋 Implemented vs Planned Features

| Feature | Status | Implementation Details |
|---|---|---|
| **Multilingual UI (EN, MR, HI)** | ✅ Implemented | Complete translated strings across navigation, forms, cards, and helpdesk |
| **Explainable Scheme Matching** | ✅ Implemented | Transparent criteria reasons (age, gender, income, district) displayed on cards |
| **Grievance AI Priority Triage** | ✅ Implemented | Automatic detection of high-risk keywords and department routing |
| **Co-located Duplicate Detection** | ✅ Implemented | Locality-based proximity check against existing active complaints |
| **Interactive Status Timeline** | ✅ Implemented | 5-stage progression with timestamped officer audit trail |
| **Preliminary Document OCR** | ✅ Implemented | Field extraction, completeness checklist, and anomaly advisory flags |
| **Officer Case Management** | ✅ Implemented | Interactive status updates, department reassignment, and internal notes |
| **Executive Analytics** | ✅ Implemented | Dynamic Recharts visualizations computed directly from active dataset |
| **Live Aadhaar / DigiLocker API** | 🔮 Planned | Requires UIDAI and state sandbox certifications in production phase |
| **Municipal GIS Hotspot Map** | 🔮 Planned | Integration with Maharashtra Geo-Portal (MahaGeoPlatform) |

---

## 🔒 Security, Privacy, and Responsible AI

1. **Zero High-Risk Identity Collection:** LOKORITHM does not collect Aadhaar credentials, OTPs, or bank passwords.
2. **Human-in-the-Loop Authority:** AI classifications are marked as *advisory suggestions*. Final ticket closures are performed by certified municipal officers.
3. **Transparent Demonstration Labeling:** Prominent headers and footers indicate prototype status to prevent misrepresentation.
4. **Data Isolation:** Demonstration records can be reset at any time via the one-click reset button.

---

## 👥 Credits & Hackathon Information

- **Project:** LOKORITHM — AI-Powered Citizen Services and Smart Governance
- **Submission:** Seva Innovation Challenge 2026
- **Category:** Women Category
- **Author & Developer:** Josna & Team
- **Repository:** [https://github.com/Josna13/Loksahayak_AI.git](https://github.com/Josna13/Loksahayak_AI.git)
