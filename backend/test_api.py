import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# 1. Health
r = client.get("/api/health")
assert r.status_code == 200, f"Health check failed: {r.status_code}"
print("[PASS] Health Check:", r.json()["status"])

# 2. Schemes
r = client.get("/api/schemes?category=Women%20Welfare")
assert r.status_code == 200, f"Schemes failed: {r.status_code}"
data = r.json()
print(f"[PASS] Schemes (Women Welfare): {data['count']} schemes found.")

# 3. Complaints
r = client.get("/api/complaints")
assert r.status_code == 200, f"Complaints failed: {r.status_code}"
data = r.json()
print(f"[PASS] Complaints: {data['count']} demonstration complaints listed.")

# 4. Analytics
r = client.get("/api/analytics")
assert r.status_code == 200, f"Analytics failed: {r.status_code}"
kpis = r.json()["kpis"]
print(f"[PASS] Analytics KPIs: Total={kpis['total_complaints']}, Pending={kpis['pending_review']}, Resolved={kpis['resolved']}")

# 5. Grievance Submission
r = client.post("/api/complaints", json={
    "title": "Severe road pothole causing traffic jam near Naupada",
    "description": "Deep crater on the main junction causing two-wheeler skids during evening traffic.",
    "category": "Roads & Transport",
    "district": "Thane",
    "locality": "MG Road, Naupada",
    "consent": True
})
assert r.status_code == 200, f"Complaint creation failed: {r.status_code}"
created = r.json()
print(f"[PASS] Grievance Submission: Ref ID {created['ref_id']}, Priority {created['suggested_priority']}, Dept {created['suggested_department']}")

# 6. Grievance Tracking
r = client.get(f"/api/complaints/{created['ref_id']}")
assert r.status_code == 200, f"Complaint tracking failed: {r.status_code}"
print(f"[PASS] Grievance Tracking: Verified Ref ID {r.json()['ref_id']} status is {r.json()['status']}")

# 7. Document Verification
r = client.post("/api/documents/verify", json={
    "document_type": "Tahsil Income Certificate",
    "file_name": "Sample_Income_Cert.pdf"
})
assert r.status_code == 200, f"Doc verify failed: {r.status_code}"
doc = r.json()
print(f"[PASS] Document Verification: OCR Confidence {doc['ocr_confidence']}%, Checklist items {len(doc['checklist'])}")

# 8. Assistant Chat with RAG
r = client.post("/api/assistant/chat", json={
    "message": "What documents are required for Majhi Ladki Bahin Yojana?",
    "language": "en"
})
assert r.status_code == 200, f"Chat failed: {r.status_code}"
chat = r.json()
print(f"[PASS] AI Assistant Chat: Grounded category '{chat['category']}', Source '{chat['source_title']}', {len(chat['checklist'])} docs in checklist.")

print("\n>>> ALL 8 API TEST SUITES PASSED SUCCESSFULLY! <<<")
