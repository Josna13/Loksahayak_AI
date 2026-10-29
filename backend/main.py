import os
import json
import re
import random
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests

from database import get_db, init_db, seed_data

# Ensure database is created and seeded
init_db()
seed_data()

app = FastAPI(
    title="LOKORITHM Smart Governance API",
    description="Backend REST API for LOKORITHM — AI-Powered Citizen Services and Smart Governance (Demonstration Only)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load .env if present
env_file = os.path.join(os.path.dirname(__file__), ".env")
if not os.path.exists(env_file):
    env_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.strip().split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def call_gemini_api(prompt: str, context: str, lang: str):
    if not GEMINI_API_KEY:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    lang_name = "Marathi" if lang == "mr" else "Hindi" if lang == "hi" else "English"
    sys_instruction = (
        f"You are LOKORITHM, an AI Citizen Services Assistant for Maharashtra State & Central Government public welfare. "
        f"Answer the citizen inquiry politely and concisely in {lang_name}. "
        f"Ground your answer strictly on verified Maharashtra Government rules (Aaple Sarkar, WCD Maharashtra, MahaDBT). "
        f"Never fabricate deadlines, fees, or official links. "
        f"Context from database: {context}"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": f"{sys_instruction}\n\nCitizen Question: {prompt}"}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 600
        }
    }
    try:
        res = requests.post(url, json=payload, timeout=6)
        if res.status_code == 200:
            data = res.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print("Gemini API call failed, falling back to local grounded knowledge:", e)
    return None

# ----------------- Models -----------------

class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=15, max_length=3000)
    category: str
    district: str
    locality: str
    photo_url: Optional[str] = None
    language: Optional[str] = "en"
    consent: bool = Field(..., description="Consent for demo data processing")

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    assigned_department: Optional[str] = None
    current_priority: Optional[str] = None
    internal_notes: Optional[str] = None
    officer_name: Optional[str] = "Officer (Demo)"

class ChatMessage(BaseModel):
    message: str
    language: Optional[str] = "en"
    category: Optional[str] = None

class DocumentVerifyRequest(BaseModel):
    document_type: str
    file_name: str
    file_size_kb: Optional[int] = 120
    demo_sample_id: Optional[str] = None

class SchemeAdminItem(BaseModel):
    title: str
    level: str
    category: str
    target_group: str
    description: str
    eligibility_summary: str
    min_age: int = 0
    max_age: int = 100
    occupation: str = "all"
    max_income: int = -1
    gender_restriction: str = "all"
    required_docs: List[str]
    official_url: Optional[str] = None
    status: str = "Published"

# ----------------- Helpers -----------------

def classify_complaint_ai(title: str, description: str, category_input: str, district: str, locality: str):
    text = f"{title} {description}".lower()
    
    # Priority estimation
    priority = "Medium"
    high_urgency_words = ["danger", "accident", "hospital", "patient", "poison", "contaminat", "collapse", "burst", "urgent", "electric shock", "hazard", "overflow", "severe"]
    low_urgency_words = ["delay", "enquiry", "routine", "portal", "spelling", "information", "slow"]
    
    if any(w in text for w in high_urgency_words):
        priority = "High"
    elif any(w in text for w in low_urgency_words):
        priority = "Low"

    # Category refinement
    cat = category_input
    if "water" in text or "pipeline" in text or "drain" in text or "sewage" in text:
        cat = "Water Supply"
    elif "pothole" in text or "road" in text or "traffic" in text or "highway" in text or "bridge" in text:
        cat = "Roads & Transport"
    elif "garbage" in text or "waste" in text or "sanitation" in text or "trash" in text:
        cat = "Sanitation & Waste"
    elif "light" in text or "electricity" in text or "power" in text or "wire" in text:
        cat = "Electricity & Lighting"
    elif "women" in text or "girl" in text or "safety" in text or "harassment" in text:
        cat = "Women Safety & Welfare"
    elif "scholarship" in text or "school" in text or "college" in text or "pension" in text:
        cat = "Education & Welfare Services"

    # Department mapping
    dept_map = {
        "Water Supply": "Maharashtra Jeevan Pradhikaran (MJP) & Municipal Water Works",
        "Roads & Transport": "Public Works Department (PWD) Maharashtra / Municipal Corp",
        "Sanitation & Waste": "Municipal Solid Waste Management Department",
        "Electricity & Lighting": "Maharashtra State Electricity Distribution Co. (MSEDCL)",
        "Women Safety & Welfare": "Women & Child Development Cell / Local Police Helpdesk",
        "Education & Welfare Services": "Department of Social Justice & Special Assistance",
        "Public Facilities": "District Urban Development Agency (DUDA)"
    }
    suggested_dept = dept_map.get(cat, f"District Collectorate — {district}")

    # Duplicate detection against existing database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ref_id, title, locality FROM complaints 
        WHERE district = ? AND category = ? AND status != 'Resolved'
    """, (district, cat))
    existing = cursor.fetchall()
    conn.close()

    duplicate_warning = 0
    duplicate_details = None

    for ex in existing:
        ex_words = set(re.findall(r'\w+', ex["locality"].lower() + " " + ex["title"].lower()))
        new_words = set(re.findall(r'\w+', locality.lower() + " " + title.lower()))
        intersection = ex_words.intersection(new_words)
        if len(intersection) >= 2 or locality.lower() in ex["locality"].lower() or ex["locality"].lower() in locality.lower():
            duplicate_warning = 1
            duplicate_details = f"Possible duplicate or co-located complaint {ex['ref_id']} ('{ex['title'][:40]}...') registered in {ex['locality']}."
            break

    return {
        "suggested_category": cat,
        "suggested_priority": priority,
        "suggested_department": suggested_dept,
        "duplicate_warning": duplicate_warning,
        "duplicate_details": duplicate_details
    }

# ----------------- Routes -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LOKORITHM Smart Governance API",
        "mode": "Demonstration Prototype",
        "jurisdiction": "Maharashtra, India",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/schemes")
def list_schemes(
    search: Optional[str] = None,
    category: Optional[str] = None,
    district: Optional[str] = None,
    age: Optional[int] = None,
    occupation: Optional[str] = None,
    max_income: Optional[int] = None,
    gender: Optional[str] = None
):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE status = 'Published'")
    rows = cursor.fetchall()
    conn.close()

    schemes = []
    for r in rows:
        scheme = dict(r)
        scheme["required_docs"] = json.loads(scheme["required_docs"]) if scheme["required_docs"] else []
        scheme["match_reasons"] = []
        is_match = True

        # Search filter
        if search:
            q = search.lower()
            if q not in scheme["title"].lower() and q not in scheme["description"].lower() and q not in scheme["category"].lower():
                is_match = False

        # Category filter
        if category and category != "All" and category.lower() not in scheme["category"].lower():
            is_match = False

        # Age filter
        if age is not None and age > 0:
            if age < scheme["min_age"] or age > scheme["max_age"]:
                is_match = False
            else:
                scheme["match_reasons"].append(f"Applicant age ({age} yrs) falls within eligible window {scheme['min_age']}-{scheme['max_age']} yrs")

        # Gender filter
        if gender and gender.lower() in ["female", "woman", "girl"]:
            if scheme["gender_restriction"] == "female":
                scheme["match_reasons"].append("Designated Women Empowerment Scheme")
        elif gender and gender.lower() in ["male", "man"]:
            if scheme["gender_restriction"] == "female":
                is_match = False

        # Income filter
        if max_income is not None and max_income > 0:
            if scheme["max_income"] > 0:
                if max_income <= scheme["max_income"]:
                    scheme["match_reasons"].append(f"Family income ₹{max_income:,} is within ceiling of ₹{scheme['max_income']:,}")
                else:
                    is_match = False

        # Occupation filter
        if occupation and occupation != "all":
            if scheme["occupation"] != "all" and occupation.lower() not in scheme["occupation"].lower():
                # Not a strict drop if general public scheme
                pass
            elif scheme["occupation"] != "all" and occupation.lower() in scheme["occupation"].lower():
                scheme["match_reasons"].append(f"Tailored for {occupation.capitalize()} beneficiaries")

        if is_match:
            if not scheme["match_reasons"]:
                scheme["match_reasons"].append("Standard eligibility criteria matched for Maharashtra residents")
            schemes.append(scheme)

    return {"count": len(schemes), "schemes": schemes}

@app.get("/api/schemes/{scheme_id}")
def get_scheme(scheme_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schemes WHERE id = ?", (scheme_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Scheme not found")
    data = dict(row)
    data["required_docs"] = json.loads(data["required_docs"]) if data["required_docs"] else []
    return data

@app.get("/api/complaints")
def list_complaints(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    district: Optional[str] = None
):
    conn = get_db()
    cursor = conn.cursor()
    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if category and category != "All":
        query += " AND category = ?"
        params.append(category)

    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    if priority and priority != "All":
        query += " AND current_priority = ?"
        params.append(priority)

    if district and district != "All":
        query += " AND district = ?"
        params.append(district)

    if search:
        query += " AND (ref_id LIKE ? OR title LIKE ? OR locality LIKE ? OR description LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return {"count": len(rows), "complaints": [dict(r) for r in rows]}

@app.get("/api/complaints/{ref_id}")
def get_complaint(ref_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE ref_id = ?", (ref_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Complaint with reference ID {ref_id} was not found.")

    complaint = dict(row)
    cursor.execute("SELECT * FROM audit_logs WHERE complaint_ref_id = ? ORDER BY created_at ASC", (ref_id,))
    audits = [dict(a) for a in cursor.fetchall()]
    conn.close()

    complaint["timeline"] = audits
    return complaint

@app.post("/api/complaints")
def create_complaint(body: ComplaintCreate):
    if not body.consent:
        raise HTTPException(status_code=400, detail="Consent for demonstration processing is required.")

    ai_analysis = classify_complaint_ai(
        title=body.title,
        description=body.description,
        category_input=body.category,
        district=body.district,
        locality=body.locality
    )

    now = datetime.now()
    # Generate realistic reference ID
    random_num = random.randint(1010, 9999)
    ref_id = f"LOKO-DEMO-{random_num}"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO complaints (
        ref_id, title, description, category, district, locality, photo_url,
        language, suggested_priority, current_priority, suggested_department,
        assigned_department, status, duplicate_warning, duplicate_details,
        created_at, updated_at, internal_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ref_id,
        body.title,
        body.description,
        ai_analysis["suggested_category"],
        body.district,
        body.locality,
        body.photo_url,
        body.language,
        ai_analysis["suggested_priority"],
        ai_analysis["suggested_priority"],
        ai_analysis["suggested_department"],
        ai_analysis["suggested_department"],
        "Submitted",
        ai_analysis["duplicate_warning"],
        ai_analysis["duplicate_details"],
        now.isoformat(),
        now.isoformat(),
        ""
    ))

    # Audit entry
    cursor.execute("""
    INSERT INTO audit_logs (complaint_ref_id, action, performed_by, details, created_at)
    VALUES (?, ?, ?, ?, ?)
    """, (
        ref_id,
        "Grievance Submitted",
        "Citizen (Online Portal)",
        f"Grievance registered. AI classified category as {ai_analysis['suggested_category']} and estimated priority as {ai_analysis['suggested_priority']}.",
        now.isoformat()
    ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "ref_id": ref_id,
        "status": "Submitted",
        "category": ai_analysis["suggested_category"],
        "suggested_priority": ai_analysis["suggested_priority"],
        "suggested_department": ai_analysis["suggested_department"],
        "duplicate_warning": bool(ai_analysis["duplicate_warning"]),
        "duplicate_details": ai_analysis["duplicate_details"],
        "created_at": now.isoformat(),
        "disclaimer": "Demo complaint — not submitted to an actual government department. Retained for evaluation only."
    }

@app.patch("/api/complaints/{ref_id}")
def update_complaint(ref_id: str, body: ComplaintUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE ref_id = ?", (ref_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint = dict(row)
    now = datetime.now().isoformat()
    changes = []

    new_status = body.status if body.status else complaint["status"]
    if body.status and body.status != complaint["status"]:
        changes.append(f"Status changed from '{complaint['status']}' to '{body.status}'")

    new_dept = body.assigned_department if body.assigned_department else complaint["assigned_department"]
    if body.assigned_department and body.assigned_department != complaint["assigned_department"]:
        changes.append(f"Department reassigned to '{body.assigned_department}'")

    new_prio = body.current_priority if body.current_priority else complaint["current_priority"]
    if body.current_priority and body.current_priority != complaint["current_priority"]:
        changes.append(f"Priority updated to '{body.current_priority}'")

    new_notes = complaint["internal_notes"] or ""
    if body.internal_notes:
        timestamp_note = f"[{datetime.now().strftime('%d %b %Y %H:%M')}] {body.officer_name}: {body.internal_notes}"
        new_notes = f"{new_notes}\n{timestamp_note}".strip()
        changes.append("Internal officer note appended")

    cursor.execute("""
    UPDATE complaints SET
        status = ?,
        assigned_department = ?,
        current_priority = ?,
        internal_notes = ?,
        updated_at = ?
    WHERE ref_id = ?
    """, (new_status, new_dept, new_prio, new_notes, now, ref_id))

    if changes:
        cursor.execute("""
        INSERT INTO audit_logs (complaint_ref_id, action, performed_by, details, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, (ref_id, "Officer Case Update", body.officer_name, "; ".join(changes), now))

    conn.commit()
    conn.close()

    return {"success": True, "ref_id": ref_id, "updated_at": now, "changes": changes}

@app.get("/api/analytics")
def get_analytics():
    conn = get_db()
    cursor = conn.cursor()

    # Category breakdown
    cursor.execute("SELECT category, COUNT(*) as count FROM complaints GROUP BY category")
    by_category = [dict(r) for r in cursor.fetchall()]

    # Status breakdown
    cursor.execute("SELECT status, COUNT(*) as count FROM complaints GROUP BY status")
    by_status = [dict(r) for r in cursor.fetchall()]

    # Priority breakdown
    cursor.execute("SELECT current_priority, COUNT(*) as count FROM complaints GROUP BY current_priority")
    by_priority = [dict(r) for r in cursor.fetchall()]

    # District breakdown
    cursor.execute("SELECT district, COUNT(*) as count FROM complaints GROUP BY district ORDER BY count DESC")
    by_district = [dict(r) for r in cursor.fetchall()]

    # Total counts
    cursor.execute("SELECT COUNT(*) FROM complaints")
    total_complaints = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Submitted' OR status = 'Under Review'")
    pending_review = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'In Progress' OR status = 'Assigned'")
    in_progress = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Resolved'")
    resolved = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE current_priority = 'High' AND status != 'Resolved'")
    approaching_deadline = cursor.fetchone()[0]

    conn.close()

    # Dynamic Key Observations derived from actual data
    top_cat = by_category[0]["category"] if by_category else "Infrastructure"
    top_dist = by_district[0]["district"] if by_district else "Pune"
    
    observations = [
        f"'{top_cat}' accounts for the highest grievance volume in this demonstration dataset.",
        f"District '{top_dist}' shows the highest density of reported civic complaints, primarily concerning water distribution and road maintenance.",
        f"Resolution efficiency is currently at {round((resolved/total_complaints)*100 if total_complaints else 0)}% across all logged cases.",
        f"{approaching_deadline} high-priority case(s) currently require expedited administrative review before standard 15-day SLA limits."
    ]

    # Timeline trend data (simulated 7 days)
    timeline_trend = [
        {"date": "23 Oct", "submitted": 2, "resolved": 1},
        {"date": "24 Oct", "submitted": 4, "resolved": 2},
        {"date": "25 Oct", "submitted": 3, "resolved": 3},
        {"date": "26 Oct", "submitted": 5, "resolved": 2},
        {"date": "27 Oct", "submitted": 2, "resolved": 4},
        {"date": "28 Oct", "submitted": 4, "resolved": 3},
        {"date": "29 Oct", "submitted": 3, "resolved": 1},
    ]

    return {
        "kpis": {
            "total_complaints": total_complaints,
            "pending_review": pending_review,
            "in_progress": in_progress,
            "resolved": resolved,
            "approaching_deadline": approaching_deadline,
        },
        "by_category": by_category,
        "by_status": by_status,
        "by_priority": by_priority,
        "by_district": by_district,
        "timeline_trend": timeline_trend,
        "observations": observations,
        "disclaimer": "Analytics generated from prototype demonstration records only. Does not represent actual live municipal operations."
    }

@app.post("/api/assistant/chat")
def assistant_chat(body: ChatMessage):
    user_query = body.message.strip()
    lang = body.language or "en"
    
    # Grounded RAG Knowledge Retrieval
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title, description, required_docs, process_steps, official_portal, sla_days FROM services_kb WHERE status = 'Published'")
    services = [dict(s) for s in cursor.fetchall()]
    
    cursor.execute("SELECT title, category, eligibility_summary, required_docs, official_url FROM schemes WHERE status = 'Published'")
    schemes = [dict(sc) for sc in cursor.fetchall()]
    conn.close()

    query_lower = user_query.lower()

    # Find matched services or schemes
    matched_scheme = None
    matched_service = None

    for sc in schemes:
        if sc["title"].lower() in query_lower or any(word in query_lower for word in sc["title"].lower().split() if len(word) > 4):
            matched_scheme = sc
            break
        if "ladki" in query_lower or "bahin" in query_lower or "woman" in query_lower or "women" in query_lower:
            if "ladki" in sc["title"].lower():
                matched_scheme = sc
                break
        if "mudra" in query_lower or "loan" in query_lower or "business" in query_lower:
            if "mudra" in sc["title"].lower():
                matched_scheme = sc
                break
        if "scholarship" in query_lower or "student" in query_lower or "college" in query_lower:
            if "scholarship" in sc["title"].lower():
                matched_scheme = sc
                break

    for sv in services:
        if "income" in query_lower and "income" in sv["title"].lower():
            matched_service = sv
            break
        elif ("domicile" in query_lower or "residence" in query_lower) and "domicile" in sv["title"].lower():
            matched_service = sv
            break
        elif ("caste" in query_lower or "validity" in query_lower) and "caste" in sv["title"].lower():
            matched_service = sv
            break
        elif ("grievance" in query_lower or "complaint" in query_lower or "road" in query_lower or "water" in query_lower) and "grievance" in sv["title"].lower():
            matched_service = sv
            break

    # Construct intelligent grounded answer
    category_identified = "Citizen Services"
    checklist = []
    source_title = None
    source_url = None
    next_step = "You can submit an application via the official portal or register a grievance through LOKORITHM."

    if matched_scheme:
        category_identified = matched_scheme["category"]
        docs = json.loads(matched_scheme["required_docs"]) if isinstance(matched_scheme["required_docs"], str) else matched_scheme["required_docs"]
        checklist = docs
        source_title = f"{matched_scheme['title']} (Official Portal)"
        source_url = matched_scheme["official_url"]

        if lang == "mr":
            answer = (
                f"**{matched_scheme['title']}** विषयी माहिती:\n\n"
                f"**पात्रता:** {matched_scheme['eligibility_summary']}\n\n"
                f"**आवश्यक कागदपत्रे:** खालील चेकलिस्ट पहा. तुम्ही थेट अधिकृत पोर्टलवरून किंवा जवळच्या सेतू केंद्रावरून अर्ज करू शकता."
            )
            next_step = "अधिक माहितीसाठी खाली दिलेल्या अधिकृत लिंकवर क्लिक करा किंवा योजनेची सविस्तर माहिती तपासा."
        elif lang == "hi":
            answer = (
                f"**{matched_scheme['title']}** की जानकारी:\n\n"
                f"**पात्रता:** {matched_scheme['eligibility_summary']}\n\n"
                f"**आवश्यक दस्तावेज:** नीचे दी गई चेकलिस्ट देखें। आप आधिकारिक पोर्टल या नजदीकी सेतु केंद्र के माध्यम से आवेदन कर सकते हैं।"
            )
            next_step = "विस्तृत जानकारी के लिए आधिकारिक लिंक देखें।"
        else:
            answer = (
                f"### {matched_scheme['title']}\n\n"
                f"**Eligibility Overview:** {matched_scheme['eligibility_summary']}\n\n"
                f"**Key Documents Required:** Review the interactive checklist below before applying.\n\n"
                f"**Application Process:** You can enroll online through the state government portal or visit your local Tahsildar / Setu Suvidha Kendra."
            )
            next_step = f"Visit the official portal ({matched_scheme['official_url']}) to start your verified application."

    elif matched_service:
        category_identified = matched_service["category"]
        docs = json.loads(matched_service["required_docs"]) if isinstance(matched_service["required_docs"], str) else matched_service["required_docs"]
        checklist = docs
        source_title = matched_service["title"]
        source_url = matched_service["official_portal"]
        
        steps = json.loads(matched_service["process_steps"]) if isinstance(matched_service["process_steps"], str) else []
        steps_text = "\n".join(steps)

        if lang == "mr":
            answer = (
                f"### {matched_service['title']}\n\n"
                f"**वर्णन:** {matched_service['description']}\n\n"
                f"**प्रक्रिया:**\n{steps_text}\n\n"
                f"**सेवा हमी कालावधी (SLA):** {matched_service['sla_days']} दिवस."
            )
        elif lang == "hi":
            answer = (
                f"### {matched_service['title']}\n\n"
                f"**विवरण:** {matched_service['description']}\n\n"
                f"**आवेदन प्रक्रिया:**\n{steps_text}\n\n"
                f"**समय सीमा (SLA):** {matched_service['sla_days']} दिन।"
            )
        else:
            answer = (
                f"### {matched_service['title']}\n\n"
                f"{matched_service['description']}\n\n"
                f"**Step-by-Step Procedure:**\n{steps_text}\n\n"
                f"**Statutory Resolution SLA:** {matched_service['sla_days']} business days under Maharashtra Right to Public Services Act."
            )

    elif "pothole" in query_lower or "road" in query_lower or "water" in query_lower or "waste" in query_lower or "complaint" in query_lower or "grievance" in query_lower:
        category_identified = "Grievance Management"
        source_title = "LOKORITHM Citizen Grievance Redressal Framework"
        source_url = "/grievance"
        checklist = ["Exact location / GPS coordinates", "Incident description", "Photograph of the issue", "Contact phone number for SMS status updates"]
        if lang == "mr":
            answer = (
                "तुम्ही थेट LOKORITHM च्या **तक्रार नोंदणी (Grievance Portal)** द्वारे नागरी समस्यांची तक्रार नोंदवू शकता.\n\n"
                "१. तक्रारीचा प्रकार (पाणीपुरवठा, रस्ते, कचरा, वीज) निवडा.\n"
                "२. परिसराचे अचूक नाव व फोटो जोडा.\n"
                "३. आमची AI प्रणाली तात्काळ संबंधित विभागाकडे (उदा. MJP, PWD, महापालिका) तक्रार वर्ग करेल आणि ट्रॅकिंग आयडी देईल."
            )
            next_step = "पोर्टलच्या 'Submit Grievance' टॅबवर जाऊन लगेच तक्रार दाखल करा."
        elif lang == "hi":
            answer = (
                "आप LOKORITHM के **शिकायत प्रबंधन (Grievance Portal)** के माध्यम से अपनी नागरिक समस्या दर्ज करा सकते हैं।\n\n"
                "1. श्रेणी (सड़क, जल आपूर्ति, कचरा, बिजली) चुनें।\n"
                "2. स्थान और फोटो संलग्न करें।\n"
                "3. AI प्रणाली संबंधित सरकारी विभाग को शिकायत अग्रेषित करेगी और आपको ट्रैकिंग आईडी प्रदान करेगी।"
            )
            next_step = "'Submit Grievance' पेज पर जाकर तुरंत शिकायत दर्ज करें।"
        else:
            answer = (
                "You can submit public utility complaints directly via the **LOKORITHM Grievance Redressal System**.\n\n"
                "1. Specify the category (Roads, Water, Sanitation, Electricity, etc.).\n"
                "2. Provide your district and locality, along with an optional photograph.\n"
                "3. Our AI classification engine automatically routes the complaint to the designated department (e.g. PWD, MJP, or Municipal Corporation) and assigns an SLA priority."
            )
            next_step = "Navigate to the 'Submit Grievance' section to file and receive an instant reference tracking ID."

    else:
        # General response with helpful suggestions
        source_title = "Aaple Sarkar / National Government Services Directory"
        source_url = "https://services.india.gov.in"
        checklist = ["Aadhaar Card", "Proof of Address", "Income Certificate", "Passport Photograph"]
        if lang == "mr":
            answer = (
                f"तुमच्या प्रश्नासाठी ('{user_query}'):\n\n"
                "महाराष्ट्र शासन व केंद्र शासनाच्या विविध लोककल्याणकारी योजना व दाखल्यांची माहिती उपलब्ध आहे. "
                "कृपया खालीलपैकी विशिष्ट विषयाबद्दल विचारा:\n"
                "- 'लाडकी बहीण योजनेची पात्रता काय आहे?'\n"
                "- 'उत्पन्नाचा दाखला कसा काढावा?'\n"
                "- 'रस्त्यावरील खड्ड्यांची तक्रार कशी करावी?'\n"
                "- 'मुद्रा कर्जासाठी कोणती कागदपत्रे लागतात?'"
            )
            next_step = "वरीलपैकी एक प्रश्न निवडा किंवा स्कीम फायंडर वापरा."
        elif lang == "hi":
            answer = (
                f"आपके प्रश्न ('{user_query}') के संबंध में:\n\n"
                "महाराष्ट्र और केंद्र सरकार की योजनाओं एवं नागरिक सेवाओं की प्रमाणित जानकारी यहां उपलब्ध है। "
                "आप निम्न में से कोई विशिष्ट प्रश्न पूछ सकते हैं:\n"
                "- 'माझी लाडकी बहिन योजना के लिए क्या पात्रता है?'\n"
                "- 'आय प्रमाण पत्र के लिए आवश्यक दस्तावेज क्या हैं?'\n"
                "- 'नागरिक शिकायत कैसे दर्ज करें?'"
            )
            next_step = "कृपया कोई सुझाव चुनें या योजना खोजक का उपयोग करें।"
        else:
            answer = (
                f"Regarding your inquiry on **'{user_query}'**:\n\n"
                "LOKORITHM provides verified guidance across Maharashtra State and Central government public services. "
                "For accurate guidance, you can ask about specific schemes, certificates, or grievance workflows:\n\n"
                "- *What documents are needed for an Income Certificate?*\n"
                "- *Am I eligible for Mukhyamantri Majhi Ladki Bahin Yojana?*\n"
                "- *How to register a municipal road repair or water complaint?*\n"
                "- *What are the loan limits under PM MUDRA Yojana?*"
            )
            next_step = "Try selecting one of the suggested service questions or explore the Smart Scheme Finder."

    # Dynamic LLM Enhancement using live Gemini 2.5 Flash if available
    context_str = ""
    if matched_scheme:
        context_str = f"Scheme: {matched_scheme['title']}. Eligibility: {matched_scheme['eligibility_summary']}. Docs: {matched_scheme['required_docs']}."
    elif matched_service:
        context_str = f"Service: {matched_service['title']}. Process: {matched_service['process_steps']}. Docs: {matched_service['required_docs']}."
    
    if context_str:
        gemini_enhanced = call_gemini_api(user_query, context_str, lang)
        if gemini_enhanced:
            answer = gemini_enhanced

    return {
        "answer": answer,
        "category": category_identified,
        "checklist": checklist,
        "source_title": source_title,
        "source_url": source_url,
        "next_step": next_step,
        "disclaimer": "AI guidance based on configured reference data. Always verify specific statutory requirements on official department portals."
    }

@app.post("/api/documents/verify")
def verify_document(body: DocumentVerifyRequest):
    # Simulated OCR extraction with realistic fields and integrity inspection
    doc_type = body.document_type
    now = datetime.now()

    if "income" in doc_type.lower():
        extracted_fields = {
            "Certificate Number": "MH-REV-INC-2026-88914",
            "Applicant Name": "Sunita Ramesh Jadhav",
            "Issuing Authority": "Office of Tahsildar, Haveli, Pune",
            "Annual Family Income": "₹ 1,80,000/- (Rupees One Lakh Eighty Thousand Only)",
            "Date of Issue": "14/07/2026",
            "Validity Period": "Valid for Financial Year 2026-2027",
            "Digital Signature": "VERIFIED (e-Sign by Nayab Tahsildar)"
        }
        checklist = [
            {"item": "Annual Income Mentioned", "status": "Passed"},
            {"item": "Competent Authority Seal", "status": "Passed"},
            {"item": "Valid Financial Year", "status": "Passed"},
            {"item": "Applicant Name Match", "status": "Passed"}
        ]
        flags = []
        is_valid = True

    elif "domicile" in doc_type.lower():
        extracted_fields = {
            "Certificate Number": "MH-GAD-DOM-2025-41203",
            "Applicant Name": "Sunita Ramesh Jadhav",
            "Issuing Magistrate": "Executive Magistrate, Pune Division",
            "Continuous Residence": "18 Years in Maharashtra State",
            "Date of Issue": "03/11/2025",
            "Digital Seal": "VERIFIED (Aaple Sarkar Barcode Present)"
        }
        checklist = [
            {"item": "Residency > 15 Years", "status": "Passed"},
            {"item": "Magistrate Signature", "status": "Passed"},
            {"item": "Official QR Code", "status": "Passed"}
        ]
        flags = [
            {"type": "Advisory", "message": "Issued in previous calendar year 2025; accepted for residency, but check if recent re-verification is mandated by the target department."}
        ]
        is_valid = True

    elif "caste" in doc_type.lower():
        extracted_fields = {
            "Certificate Number": "MH-BARTI-CST-2024-19022",
            "Applicant Name": "Sunita Ramesh Jadhav",
            "Recognized Category": "OBC (Other Backward Class)",
            "Sub-Caste": "Mali (Serial No. 182)",
            "Issuing Officer": "Sub-Divisional Officer (SDO), Baramati Division",
            "Validity Status": "Caste Certificate only (Separate Caste Validity Certificate required for higher education/election)"
        }
        checklist = [
            {"item": "Sub-Divisional Officer Stamp", "status": "Passed"},
            {"item": "Genealogy Proof Reference", "status": "Passed"},
            {"item": "Caste Validity Scrutiny Document", "status": "Needs Review"}
        ]
        flags = [
            {"type": "Action Required", "message": "For university admissions or government recruitment, an accompanying 'Caste Validity Certificate' from the District Scrutiny Committee is required."}
        ]
        is_valid = True

    else:
        # Generic document
        extracted_fields = {
            "Document Title": doc_type,
            "File Name": body.file_name,
            "Document Identifier": f"DOC-{random.randint(10000, 99999)}",
            "Document Date": "2026-05-10",
            "Extracted Name": "Sunita Ramesh Jadhav",
            "Text Confidence Score": "94.2%"
        }
        checklist = [
            {"item": "Document Legibility", "status": "Passed"},
            {"item": "Header Identification", "status": "Passed"},
            {"item": "Signature / Stamp Block", "status": "Review Recommended"}
        ]
        flags = [
            {"type": "Information", "message": "Preliminary OCR extraction successful. Standard visual inspection recommended."}
        ]
        is_valid = True

    return {
        "document_type": doc_type,
        "file_name": body.file_name,
        "is_valid": is_valid,
        "extracted_fields": extracted_fields,
        "checklist": checklist,
        "flags": flags,
        "ocr_confidence": 96.5,
        "disclaimer": "This is an automated preliminary check. An authorized person must review any flagged issue. Not a formal government certification."
    }

@app.get("/api/admin/services")
def get_admin_services():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services_kb ORDER BY id DESC")
    kb_records = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT id, title, level, category, status, official_url FROM schemes ORDER BY id DESC")
    scheme_records = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "services": kb_records,
        "schemes": scheme_records
    }

@app.post("/api/admin/services")
def create_admin_service(body: Dict[str, Any]):
    title = body.get("title", "Untitled Service")
    category = body.get("category", "General")
    description = body.get("description", "")
    required_docs = json.dumps(body.get("required_docs", ["Aadhaar Card", "Application Form"]))
    process_steps = json.dumps(body.get("process_steps", ["1. Online submission", "2. Department verification"]))
    sla_days = body.get("sla_days", 15)
    official_portal = body.get("official_portal", "https://aaplesarkar.mahaonline.gov.in")
    source_title = body.get("source_title", "Government Rules Directory")
    last_verified = datetime.now().strftime("%Y-%m-%d")
    status = body.get("status", "Published")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO services_kb (
        title, category, description, required_docs, process_steps,
        sla_days, official_portal, source_title, last_verified, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (title, category, description, required_docs, process_steps, sla_days, official_portal, source_title, last_verified, status))
    conn.commit()
    conn.close()

    return {"success": True, "message": "Reference service record created successfully."}

@app.post("/api/reset-data")
def reset_database():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS complaints")
    cursor.execute("DROP TABLE IF EXISTS schemes")
    cursor.execute("DROP TABLE IF EXISTS services_kb")
    cursor.execute("DROP TABLE IF EXISTS audit_logs")
    conn.commit()
    conn.close()

    init_db()
    seed_data()
    return {"success": True, "message": "Demonstration database reset to initial seeded state."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
