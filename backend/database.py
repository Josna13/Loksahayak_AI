import sqlite3
import json
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "lokorithm.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Complaints Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        district TEXT NOT NULL,
        locality TEXT NOT NULL,
        photo_url TEXT,
        language TEXT DEFAULT 'en',
        suggested_priority TEXT NOT NULL,
        current_priority TEXT NOT NULL,
        suggested_department TEXT NOT NULL,
        assigned_department TEXT NOT NULL,
        status TEXT NOT NULL,
        duplicate_warning INTEGER DEFAULT 0,
        duplicate_details TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        internal_notes TEXT DEFAULT ''
    )
    """)

    # Schemes Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        title_mr TEXT,
        title_hi TEXT,
        level TEXT NOT NULL,
        category TEXT NOT NULL,
        target_group TEXT NOT NULL,
        description TEXT NOT NULL,
        description_mr TEXT,
        description_hi TEXT,
        eligibility_summary TEXT NOT NULL,
        min_age INTEGER DEFAULT 0,
        max_age INTEGER DEFAULT 120,
        occupation TEXT DEFAULT 'all',
        employment_status TEXT DEFAULT 'all',
        max_income INTEGER DEFAULT -1,
        gender_restriction TEXT DEFAULT 'all',
        required_docs TEXT NOT NULL,
        deadline TEXT,
        official_url TEXT,
        status TEXT DEFAULT 'Published',
        match_criteria TEXT
    )
    """)

    # Services / Knowledge Base Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services_kb (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        required_docs TEXT NOT NULL,
        process_steps TEXT NOT NULL,
        sla_days INTEGER DEFAULT 15,
        official_portal TEXT,
        source_title TEXT,
        last_verified TEXT,
        status TEXT DEFAULT 'Published'
    )
    """)

    # Audit History
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        complaint_ref_id TEXT NOT NULL,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def seed_data():
    conn = get_db()
    cursor = conn.cursor()

    # Check if complaints table is empty
    cursor.execute("SELECT COUNT(*) FROM complaints")
    if cursor.fetchone()[0] == 0:
        now = datetime.now()
        sample_complaints = [
            (
                "LOKO-DEMO-1001",
                "Low water pressure and contaminated pipeline in Ramnagar",
                "Residents in Ramnagar area have been facing acute low water pressure for the last 10 days. Water supplied yesterday evening was brownish with foul odour, posing health risks to over 150 families.",
                "Water Supply",
                "Pune",
                "Ramnagar, Haveli Taluka",
                None,
                "en",
                "High",
                "High",
                "Maharashtra Jeevan Pradhikaran (MJP)",
                "Maharashtra Jeevan Pradhikaran (MJP)",
                "In Progress",
                0,
                None,
                (now - timedelta(days=4, hours=3)).isoformat(),
                (now - timedelta(days=1)).isoformat(),
                "Field inspection conducted on 26 Oct. Pipeline joint rupture detected near survey no. 42. Replacement pipe sanctioned; work underway."
            ),
            (
                "LOKO-DEMO-1002",
                "Dangerous deep potholes and broken road divider near MG Road Junction",
                "Multiple deep potholes stretching across 200 metres near Naupada junction causing severe traffic jams and two-wheeler skidding accidents during evening hours.",
                "Roads & Transport",
                "Thane",
                "MG Road, Naupada Ward",
                None,
                "en",
                "High",
                "High",
                "Thane Municipal Corporation (PWD)",
                "Thane Municipal Corporation (PWD)",
                "Under Review",
                0,
                None,
                (now - timedelta(days=2, hours=5)).isoformat(),
                (now - timedelta(days=2)).isoformat(),
                "Inspection scheduled by Ward Junior Engineer for patch-work estimation."
            ),
            (
                "LOKO-DEMO-1003",
                "Non-functioning solar high-mast streetlights near Rural Healthcare Centre",
                "All 4 solar lights outside the Primary Healthcare Centre and Gram Panchayat office have been out of order for 3 weeks, causing safety issues for women patients visiting late evening.",
                "Electricity & Lighting",
                "Pune",
                "Baramati Rural, near PHC",
                None,
                "mr",
                "Medium",
                "Medium",
                "MSEDCL & District Rural Development Agency",
                "MSEDCL & District Rural Development Agency",
                "Assigned",
                0,
                None,
                (now - timedelta(days=6)).isoformat(),
                (now - timedelta(days=3)).isoformat(),
                "Contractor notified to replace faulty solar charge controllers."
            ),
            (
                "LOKO-DEMO-1004",
                "Overflowing municipal garbage containers attracting stray animals",
                "Community waste bin in Andheri East vegetable market has not been emptied for 4 days. Waste spilled onto the street causing terrible smell and hygiene hazard.",
                "Sanitation & Waste",
                "Mumbai Suburban",
                "Andheri East, Sector 3 Market",
                None,
                "hi",
                "Medium",
                "Medium",
                "Brihanmumbai Municipal Corporation (SWM)",
                "Brihanmumbai Municipal Corporation (SWM)",
                "Resolved",
                0,
                None,
                (now - timedelta(days=8)).isoformat(),
                (now - timedelta(days=6)).isoformat(),
                "Sanitation compactor deployed on 23 Oct. Disinfection spray completed."
            ),
            (
                "LOKO-DEMO-1005",
                "Delay in processing Post-Matric girl student scholarship documents",
                "Application filed 45 days ago through MahaDBT. Scrutiny pending at District Social Welfare Department office despite complete document submission.",
                "Education & Welfare Services",
                "Nashik",
                "Nashik Road, District Welfare Office",
                None,
                "en",
                "Low",
                "Low",
                "Department of Social Justice & Special Assistance",
                "Department of Social Justice & Special Assistance",
                "Under Review",
                0,
                None,
                (now - timedelta(days=12)).isoformat(),
                (now - timedelta(days=10)).isoformat(),
                "Desk clerk assigned to verify bonafide certificate."
            ),
            (
                "LOKO-DEMO-1006",
                "Pipeline leakage flooding pedestrian walkway in Sadar Bazar",
                "Drinking water pipe valve cracked near police chowki. Gallons of clean water wasted daily while path is submerged.",
                "Water Supply",
                "Nagpur",
                "Sadar Bazar, Zone 2",
                None,
                "en",
                "Medium",
                "Medium",
                "Nagpur Municipal Corporation (Water Works)",
                "Nagpur Municipal Corporation (Water Works)",
                "Submitted",
                0,
                None,
                (now - timedelta(hours=18)).isoformat(),
                (now - timedelta(hours=18)).isoformat(),
                ""
            )
        ]

        cursor.executemany("""
        INSERT INTO complaints (
            ref_id, title, description, category, district, locality, photo_url,
            language, suggested_priority, current_priority, suggested_department,
            assigned_department, status, duplicate_warning, duplicate_details,
            created_at, updated_at, internal_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_complaints)

        # Preseed audit logs
        sample_audits = [
            ("LOKO-DEMO-1001", "Grievance Submitted", "Citizen (Public Portal)", "Complaint registered successfully with initial priority High.", (now - timedelta(days=4, hours=3)).isoformat()),
            ("LOKO-DEMO-1001", "Assigned Department", "System AI Classifier", "Assigned to Maharashtra Jeevan Pradhikaran based on water contamination urgency.", (now - timedelta(days=4, hours=2)).isoformat()),
            ("LOKO-DEMO-1001", "Status Updated to In Progress", "Officer S. Patil (Executive Engineer)", "Site inspection ordered and repair team dispatched.", (now - timedelta(days=1)).isoformat()),
            ("LOKO-DEMO-1002", "Grievance Submitted", "Citizen (Public Portal)", "Pothole complaint registered with high traffic impact.", (now - timedelta(days=2, hours=5)).isoformat()),
            ("LOKO-DEMO-1002", "Status Updated to Under Review", "Desk Officer (Thane PWD)", "Reviewing road jurisdiction between TMC and MSRDC.", (now - timedelta(days=2)).isoformat()),
            ("LOKO-DEMO-1004", "Status Updated to Resolved", "Zonal Sanitary Inspector BMC", "Garbage cleared, area sanitized with bleaching powder.", (now - timedelta(days=6)).isoformat())
        ]
        cursor.executemany("""
        INSERT INTO audit_logs (complaint_ref_id, action, performed_by, details, created_at)
        VALUES (?, ?, ?, ?, ?)
        """, sample_audits)

    # Check if schemes table is empty
    cursor.execute("SELECT COUNT(*) FROM schemes")
    if cursor.fetchone()[0] == 0:
        sample_schemes = [
            (
                "Mukhyamantri Majhi Ladki Bahin Yojana",
                "मुख्यमंत्री माझी लाडकी बहीण योजना",
                "मुख्यमंत्री माझी लाडकी बहिन योजना",
                "Maharashtra State",
                "Women Welfare",
                "Women aged 21 to 65 years with annual family income up to ₹2.50 Lakh",
                "Direct monthly financial transfer of ₹1,500 into the Aadhaar-linked bank accounts of eligible women in Maharashtra to foster financial autonomy and nutritional well-being.",
                "महाराष्ट्रातील पात्र महिलांना स्वावलंबन आणि पोषणासाठी दरमहा ₹१,५०० थेट बँक खात्यात.",
                "महाराष्ट्र की पात्र महिलाओं को आर्थिक संबल देने के लिए ₹1,500 प्रति माह बैंक खाते में।",
                "Female resident of Maharashtra; Age 21-65; Annual family income ≤ ₹2.5 Lakh; Yellow or Orange Ration Card holder; Valid Aadhaar-linked bank account.",
                21, 65, "all", "all", 250000, "female",
                json.dumps(["Aadhaar Card", "Ration Card (Yellow/Orange)", "Income Certificate or Ration Card proof", "Maharashtra Domicile Certificate / Voter ID", "Bank Passbook with linked Aadhaar"]),
                "Ongoing Scheme (Annual enrollment)",
                "https://ladakibahin.maharashtra.gov.in",
                "Published",
                json.dumps(["gender: female", "age: 21-65", "income <= 250000", "state: Maharashtra"])
            ),
            (
                "Sanjay Gandhi Niradhar Anudan Yojana",
                "संजय गांधी निराधार अनुदान योजना",
                "संजय गांधी निराधार अनुदान योजना",
                "Maharashtra State",
                "Social Welfare",
                "Destitute individuals, abandoned women, divorcees, widows, and persons with 40%+ disability",
                "State government monthly pension of ₹1,500 per month for destitute citizens, single women without breadwinner support, and persons with severe disabilities.",
                "निराधार व्यक्ती, घटस्फोटित महिला, विधवा आणि दिव्यांगांना दरमहा ₹१,५०० आर्थिक साहाय्य.",
                "निराधार व्यक्तियों, परित्यक्ता महिलाओं और दिव्यांगों को ₹1,500 प्रति माह पेंशन।",
                "Resident of Maharashtra for at least 15 years; Annual family income up to ₹50,000 (relaxed for widows/differently-abled); Age under 65 (for destitute/widows).",
                18, 65, "all", "all", 50000, "all",
                json.dumps(["Proof of Age", "15 Years Domicile Certificate", "Income Certificate (Tahsildar)", "Medical Certificate for Disability (if applicable)", "Death Certificate of Spouse (for widows)"]),
                "Open year-round via Tahsildar Office",
                "https://aaplesarkar.mahaonline.gov.in",
                "Published",
                json.dumps(["income <= 50000", "vulnerability: destitute/widow/disabled", "state: Maharashtra"])
            ),
            (
                "Lek Ladki Yojana (Empowering the Girl Child)",
                "लेक लाडकी योजना",
                "लेक लाडकी योजना",
                "Maharashtra State",
                "Women Welfare",
                "Girl child born in yellow/orange ration card families after 1 April 2023",
                "Comprehensive financial aid in 5 phases totaling ₹1,01,000 for the education, healthcare, and higher studies of girls until they turn 18 years.",
                "मुलीच्या जन्मापासून १८ वर्षांपर्यंत ५ टप्प्यांत एकूण ₹१,०१,००० ची आर्थिक मदत.",
                "बालिकाओं को 18 वर्ष की आयु तक 5 चरणों में कुल ₹1,01,000 की वित्तीय सहायता।",
                "Girl child born in Maharashtra after 1 April 2023; Family holding yellow or orange ration card; Parents must undergo family planning after two children.",
                0, 18, "student", "all", 100000, "female",
                json.dumps(["Girl's Birth Certificate", "Parents Aadhaar Cards", "Ration Card (Yellow/Orange)", "Income Certificate", "Bank Account Details"]),
                "Open throughout the year",
                "https://womenchild.maharashtra.gov.in",
                "Published",
                json.dumps(["gender: female", "age: 0-18", "ration card: yellow/orange"])
            ),
            (
                "Pradhan Mantri MUDRA Yojana (PMMY)",
                "प्रधानमंत्री मुद्रा योजना",
                "प्रधानमंत्री मुद्रा योजना",
                "Central Government",
                "Entrepreneurship",
                "Micro and small entrepreneurs, women self-help group members, small businesses",
                "Collateral-free business loans up to ₹20 Lakhs across Shishu (up to ₹50k), Kishore (₹50k-₹5L), and Tarun (₹5L-₹20L) categories with subsidized rates for women entrepreneurs.",
                "महिला उद्योजक व लघू व्यावसायिकांसाठी विनातारण ₹२० लाखांपर्यंत व्यवसाय कर्ज.",
                "लघु उद्यमियों और महिला कारोबारियों के लिए बिना किसी गारंटी के ₹20 लाख तक का ऋण।",
                "Indian citizen with a viable business or service project; No default in previous bank loans; Special concession for women-owned microenterprises.",
                18, 65, "business", "self-employed", -1, "all",
                json.dumps(["Identity Proof (Aadhaar/PAN)", "Proof of Residence", "Business Profile and Quotations", "Bank Account Statement for 6 months", "Photographs"]),
                "Year-round via public/private banks",
                "https://www.mudra.org.in",
                "Published",
                json.dumps(["occupation: business/self-employed", "age: 18-65"])
            ),
            (
                "Pradhan Mantri Awas Yojana (PMAY-G & Urban)",
                "प्रधानमंत्री आवास योजना (शहरी व ग्रामीण)",
                "प्रधानमंत्री आवास योजना",
                "Central Government",
                "Housing",
                "Homeless families, women heads of households, EWS and LIG categories",
                "Financial assistance of ₹1.20 Lakh to ₹2.67 Lakh interest subsidy for construction of pucca houses with clean toilet, drinking water, and electricity access.",
                "बेघर आणि अल्प उत्पन्न कुटुंबांना स्वतःचे पक्के घर बांधण्यासाठी आर्थिक अनुदान.",
                "कच्चे मकानों में रहने वाले जरूरतमंद परिवारों को पक्का मकान बनाने के लिए अनुदान।",
                "Family should not own a pucca house anywhere in India; Female ownership or joint ownership mandatory for EWS/LIG in urban areas; EWS income up to ₹3L.",
                18, 75, "all", "all", 300000, "all",
                json.dumps(["Aadhaar Card", "Ration Card", "Affidavit of no pucca house", "Bank Account details", "Land/plot ownership papers or allotment letter"]),
                "Enrollment subject to annual survey",
                "https://pmaymis.gov.in",
                "Published",
                json.dumps(["housing: homeless/kutcha", "income <= 300000"])
            ),
            (
                "MahaDBT Post-Matric Scholarship for Girls & Reserved Categories",
                "महाडीबीटी मॅट्रिकोत्तर शिष्यवृत्ती",
                "महाडीबीटी पोस्ट-मैट्रिक छात्रवृत्ति",
                "Maharashtra State",
                "Education",
                "Girl students, SC/ST/OBC/VJNT/SBC/EWS pursuing diploma, degree or professional courses",
                "100% tuition fee waiver, examination fees, and maintenance allowance for girl students and eligible categories enrolled in government-recognized higher institutions.",
                "उच्च शिक्षण घेणाऱ्या विद्यार्थिनी आणि मागासवर्गीय विद्यार्थ्यांसाठी १००% शुल्कमाफी व भत्ता.",
                "उच्च शिक्षा प्राप्त कर रही छात्राओं और आरक्षित वर्ग के छात्रों के लिए पूर्ण शुल्क प्रतिपूर्ति।",
                "Resident of Maharashtra; Completed 10th standard; Enrolled in recognized university or college; Family income below ₹8 Lakh (for EBC/OBC) or ₹2.5L (SC/ST).",
                15, 30, "student", "student", 800000, "all",
                json.dumps(["Caste Certificate (if applicable)", "Income Certificate from Tahsildar", "Domicile Certificate of Maharashtra", "College Fee Receipt & ID", "Mark sheets of SSC/HSC"]),
                "Academic Year Deadlines (Usually 31 Dec)",
                "https://mahadbt.maharashtra.gov.in",
                "Published",
                json.dumps(["student: true", "age: 15-30", "state: Maharashtra"])
            ),
            (
                "Mahila E-Haat (Direct Digital Marketing for Women)",
                "महिला ई-हाट",
                "महिला ई-हाट",
                "Central Government",
                "Entrepreneurship",
                "Women entrepreneurs, self-help groups (SHGs), and women NGOs",
                "Bilingual online portal facilitating direct marketing of products and services made by women artisans, self-help groups, and small producers without middlemen.",
                "महिला बचत गट व महिला कारागिरांसाठी उत्पादने थेट ग्राहकांना विकण्यासाठी मोफत डिजिटल मंच.",
                "महिला स्वयं सहायता समूहों और कारीगरों के उत्पादों की सीधी बिक्री के लिए ई-कॉमर्स मंच।",
                "Must be a woman entrepreneur above 18 years or a verified Women Self-Help Group registered in India.",
                18, 70, "business", "self-employed", -1, "female",
                json.dumps(["Aadhaar Card", "Registration certificate of SHG or enterprise", "Bank account in entity's name", "Product catalog with photographs"]),
                "Continuous online registration",
                "https://wcd.nic.in",
                "Published",
                json.dumps(["gender: female", "occupation: artisan/artisan/business"])
            ),
            (
                "Sukanya Samriddhi Account (Beti Bachao Beti Padhao)",
                "सुकन्या समृद्धी योजना",
                "सुकन्या समृद्धि योजना",
                "Central Government",
                "Women Welfare",
                "Parents of girl children aged up to 10 years",
                "Government-backed high-interest small deposit savings scheme (8.2% p.a.) with Section 80C tax exemption for securing higher education and marriage funds for girls.",
                "मुलींच्या उज्ज्वल भविष्यासाठी आणि शिक्षणासाठी उच्च व्याजदर देणारी सुरक्षित बचत योजना.",
                "बालिकाओं की उच्च शिक्षा और भविष्य सुरक्षा के लिए सरकार की सर्वोत्तम बचत योजना।",
                "Account can be opened by biological parents or legal guardians for a girl child from birth up to 10 years; Maximum two accounts per family.",
                0, 10, "child", "all", -1, "female",
                json.dumps(["Birth Certificate of Girl Child", "Identity & Residence proof of Parent/Guardian", "Photographs of Child & Guardian"]),
                "Can be opened at any Post Office or Nationalized Bank",
                "https://www.indiapost.gov.in",
                "Published",
                json.dumps(["gender: female", "age: 0-10"])
            )
        ]

        cursor.executemany("""
        INSERT INTO schemes (
            title, title_mr, title_hi, level, category, target_group, description,
            description_mr, description_hi, eligibility_summary, min_age, max_age,
            occupation, employment_status, max_income, gender_restriction,
            required_docs, deadline, official_url, status, match_criteria
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_schemes)

    # Check if services_kb table is empty
    cursor.execute("SELECT COUNT(*) FROM services_kb")
    if cursor.fetchone()[0] == 0:
        sample_services = [
            (
                "Income Certificate (Tahsil / Sub-Divisional Office)",
                "Revenue Services",
                "Issued by Revenue Department (Tahsildar) certifying total annual earnings of the applicant and family from all sources for availing scholarships and welfare schemes.",
                json.dumps(["Ration Card", "Salary Certificate or Talathi Report", "Self-Declaration on Stamp / Form", "Aadhaar Card", "Electricity Bill (Address Proof)"]),
                json.dumps(["1. Register on Aaple Sarkar portal", "2. Upload scanned documents in PDF (<256KB)", "3. Pay nominal statutory fee (approx ₹33)", "4. Talathi verification within 7 days", "5. Digital certificate issued by Tahsildar with QR code"]),
                15,
                "https://aaplesarkar.mahaonline.gov.in",
                "Maharashtra Right to Public Services Act (RTS)",
                "2026-09-15",
                "Published"
            ),
            (
                "Domicile & Age-Nationality Certificate",
                "General Administration",
                "Official legal document proving 15+ years continuous residency in Maharashtra state, mandatory for state engineering/medical quotas and government jobs.",
                json.dumps(["Proof of 15 years continuous residence (School LC, Ration Card, Land records)", "Birth Certificate or School Leaving Certificate", "Aadhaar Card", "Electricity or Tax receipt", "Two passport photographs"]),
                json.dumps(["1. Apply via Aaple Sarkar or District Setu Suvidha Kendra", "2. Submit residency evidence of last 15 years", "3. Police or Talathi report generation", "4. Verification by Executive Magistrate / Nayab Tahsildar", "5. Download digitally signed certificate"]),
                15,
                "https://aaplesarkar.mahaonline.gov.in",
                "Maharashtra General Administration Department (GAD)",
                "2026-10-01",
                "Published"
            ),
            (
                "Public Grievance Redressal Mechanism (Aaple Sarkar Grievance)",
                "Citizen Grievances",
                "Online dispute and public grievance redressal portal where citizens can submit complaints against any department of Government of Maharashtra with SLA tracking.",
                json.dumps(["Details of location and incident", "Supporting photographs/scans (optional)", "Citizen contact info (Mobile & District)"]),
                json.dumps(["1. File grievance with department categorization", "2. Automated ticket ID generated", "3. Forwarded to Nodal Grievance Officer within 48 hours", "4. First response within 21 days", "5. Citizen can file first/second appeal if unsatisfied"]),
                21,
                "https://grievances.maharashtra.gov.in",
                "Directorate of Public Grievances, Government of Maharashtra",
                "2026-08-20",
                "Published"
            ),
            (
                "Caste Certificate & Caste Validity Process",
                "Social Welfare",
                "Official certification of recognized Scheduled Caste, Scheduled Tribe, Vimukta Jati, Nomadic Tribe, or Other Backward Class status in Maharashtra.",
                json.dumps(["Pre-1967 (or 1950/1961 based on category) genealogy records", "School LC of Father/Grandfather showing caste", "Caste Certificate of applicant", "Affidavit on Stamp Paper"]),
                json.dumps(["1. Apply for Caste Certificate at Sub-Divisional Officer (SDO)", "2. Apply separately for Caste Validity Certificate at District Scrutiny Committee for admissions/jobs", "3. Vigilance Cell verification", "4. Hearing before Scrutiny Committee", "5. Grant of Validity Certificate"]),
                45,
                "https://barti.maharashtra.gov.in",
                "Dr. Babasaheb Ambedkar Research & Training Institute (BARTI)",
                "2026-07-10",
                "Published"
            )
        ]

        cursor.executemany("""
        INSERT INTO services_kb (
            title, category, description, required_docs, process_steps,
            sla_days, official_portal, source_title, last_verified, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_services)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    seed_data()
    print("Database initialized and seeded successfully.")
