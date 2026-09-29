import json
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    client = TestClient(app)
    
    print("==================================================")
    print("REWISE AI — DIAGNOSTIC ACCURACY TEST SUITE")
    print("==================================================")

    # -------------------------------------------------------------------------
    # TEST 1: Drop with green lines -> display problem, not motherboard
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 1: 'My phone fell down and now the screen has green lines.' ---")
    payload1 = {
        "brand": "Apple",
        "model": "iPhone 13",
        "device_age_years": 2,
        "storage_gb": 128,
        "battery_condition": "Good",
        "problem_description": "My phone fell down and now the screen has green lines.",
        "user_priority": "Keep using my current phone"
    }
    res1 = client.post("/api/diagnose", json=payload1)
    assert res1.status_code == 200, f"Test 1 failed with status {res1.status_code}: {res1.text}"
    data1 = res1.json()
    nlp1 = data1.get("nlp_reasoning", {})
    ai1 = data1.get("ai_diagnosis", {})
    
    symptom_ids1 = [s["symptom_id"] for s in nlp1.get("symptoms", [])]
    event1 = nlp1.get("event", {}).get("event_type") if nlp1.get("event") else None
    probable_issue1 = nlp1.get("probable_issue", "").lower()
    affected_comp1 = nlp1.get("affected_component", "").lower()
    
    print(f"Event: {event1}")
    print(f"Active Symptoms: {symptom_ids1}")
    print(f"Probable Issue: {nlp1.get('probable_issue')}")
    print(f"Affected Component: {nlp1.get('affected_component')}")
    print(f"Confirmed Issue: {ai1.get('confirmed_issue')}")
    
    assert event1 == "drop", f"Expected event 'drop', got '{event1}'"
    assert "display_vertical_line" in symptom_ids1 or "screen_damage" in symptom_ids1, f"Missing display line symptom in {symptom_ids1}"
    assert "display" in probable_issue1 or "screen" in probable_issue1, f"Expected display issue, got '{probable_issue1}'"
    assert "motherboard" not in probable_issue1, f"Motherboard overdiagnosis detected: {probable_issue1}"
    assert "display" in affected_comp1, f"Expected affected_component containing 'display', got '{affected_comp1}'"
    print(">>> TEST 1 PASSED!")

    # -------------------------------------------------------------------------
    # TEST 2: "Display is fine but touch is not working. Phone fell down yesterday."
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 2: 'Display is fine but touch is not working. Phone fell down yesterday.' ---")
    payload2 = {
        "brand": "Apple",
        "model": "iPhone 13",
        "device_age_years": 2,
        "storage_gb": 128,
        "battery_condition": "Good",
        "problem_description": "Display is fine but touch is not working. Phone fell down yesterday.",
        "user_priority": "Lowest immediate cost"
    }
    res2 = client.post("/api/diagnose", json=payload2)
    assert res2.status_code == 200, f"Test 2 failed: {res2.text}"
    data2 = res2.json()
    nlp2 = data2.get("nlp_reasoning", {})
    ai2 = data2.get("ai_diagnosis", {})
    
    symptom_ids2 = [s["symptom_id"] for s in nlp2.get("symptoms", [])]
    negated_ids2 = [s["symptom_id"] for s in nlp2.get("negated_symptoms", [])]
    event2 = nlp2.get("event", {}).get("event_type") if nlp2.get("event") else None
    
    print(f"Event: {event2}")
    print(f"Active Symptoms: {symptom_ids2}")
    print(f"Negated Symptoms: {negated_ids2}")
    print(f"Probable Issue: {nlp2.get('probable_issue')}")
    print(f"Confirmed Issue: {ai2.get('confirmed_issue')}")
    
    assert event2 == "drop", f"Expected event 'drop', got '{event2}'"
    assert "touch_failure" in symptom_ids2, f"Expected touch_failure in {symptom_ids2}"
    assert "cracked_screen" in negated_ids2 or "screen_damage" in negated_ids2 or len(negated_ids2) > 0, f"Expected negated symptom, got {negated_ids2}"
    assert ai2.get("confirmed_issue") is None, f"Expected confirmed_issue to be None, got {ai2.get('confirmed_issue')}"
    assert "touch" in nlp2.get("probable_issue", "").lower() or "digitizer" in nlp2.get("probable_issue", "").lower(), f"Expected touch issue, got '{nlp2.get('probable_issue')}'"
    print(">>> TEST 2 PASSED!")

    # -------------------------------------------------------------------------
    # TEST 3: "Battery is draining very fast."
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 3: 'Battery is draining very fast.' ---")
    payload3 = {
        "brand": "Apple",
        "model": "iPhone 13",
        "device_age_years": 2,
        "storage_gb": 128,
        "battery_condition": "Degraded",
        "problem_description": "Battery is draining very fast.",
        "user_priority": "Keep using my current phone"
    }
    res3 = client.post("/api/diagnose", json=payload3)
    assert res3.status_code == 200, f"Test 3 failed: {res3.text}"
    data3 = res3.json()
    nlp3 = data3.get("nlp_reasoning", {})
    
    symptom_ids3 = [s["symptom_id"] for s in nlp3.get("symptoms", [])]
    probable_issue3 = nlp3.get("probable_issue", "").lower()
    
    print(f"Active Symptoms: {symptom_ids3}")
    print(f"Probable Issue: {nlp3.get('probable_issue')}")
    
    assert "battery_fast_drain" in symptom_ids3 or "battery_drain" in symptom_ids3, f"Expected battery drain symptom, got {symptom_ids3}"
    assert "battery" in probable_issue3, f"Expected battery issue, got '{probable_issue3}'"
    assert "motherboard" not in probable_issue3, f"Motherboard overdiagnosis detected: {probable_issue3}"
    print(">>> TEST 3 PASSED!")

    # -------------------------------------------------------------------------
    # TEST 4: "Phone fell in water and won't turn on."
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 4: 'Phone fell in water and won't turn on.' ---")
    payload4 = {
        "brand": "Apple",
        "model": "iPhone 13",
        "device_age_years": 1,
        "storage_gb": 128,
        "battery_condition": "Good",
        "problem_description": "Phone fell in water and won't turn on.",
        "user_priority": "I want the quickest solution"
    }
    res4 = client.post("/api/diagnose", json=payload4)
    assert res4.status_code == 200, f"Test 4 failed: {res4.text}"
    data4 = res4.json()
    nlp4 = data4.get("nlp_reasoning", {})
    ai4 = data4.get("ai_diagnosis", {})
    
    symptom_ids4 = [s["symptom_id"] for s in nlp4.get("symptoms", [])]
    event4 = nlp4.get("event", {}).get("event_type") if nlp4.get("event") else None
    
    print(f"Event: {event4}")
    print(f"Active Symptoms: {symptom_ids4}")
    print(f"Probable Issue: {nlp4.get('probable_issue')}")
    print(f"Confirmed Issue: {ai4.get('confirmed_issue')}")
    
    assert event4 == "liquid_exposure", f"Expected event 'liquid_exposure', got '{event4}'"
    assert "liquid_exposure" in symptom_ids4 or "water_damage" in symptom_ids4, f"Missing liquid exposure symptom in {symptom_ids4}"
    assert "no_power" in symptom_ids4 or "dead_device" in symptom_ids4 or "will_not_turn_on" in symptom_ids4, f"Missing no_power symptom in {symptom_ids4}"
    assert ai4.get("confirmed_issue") is None, f"Expected confirmed_issue to be None, got {ai4.get('confirmed_issue')}"
    print(">>> TEST 4 PASSED!")

    # -------------------------------------------------------------------------
    # TEST 5: "Phone not working." (Insufficient Information)
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 5: 'Phone not working.' ---")
    payload5 = {
        "brand": "Apple",
        "model": "iPhone 13",
        "device_age_years": 1,
        "storage_gb": 128,
        "battery_condition": "Good",
        "problem_description": "Phone not working."
    }
    res5 = client.post("/api/diagnose", json=payload5)
    assert res5.status_code == 200, f"Test 5 failed: {res5.text}"
    data5 = res5.json()
    nlp5 = data5.get("nlp_reasoning", {})
    
    insufficient = nlp5.get("insufficient_information")
    questions = nlp5.get("follow_up_questions", [])
    
    print(f"Insufficient Information Flag: {insufficient}")
    print(f"Follow-up Questions: {questions}")
    
    assert insufficient is True, f"Expected insufficient_information=True, got {insufficient}"
    assert len(questions) >= 3, f"Expected at least 3 follow up questions, got {len(questions)}"
    print(">>> TEST 5 PASSED!")

    # -------------------------------------------------------------------------
    # TEST 6: "Charge aagala." (Colloquial / Multilingual)
    # -------------------------------------------------------------------------
    print("\n--- RUNNING TEST 6: 'Charge aagala.' ---")
    payload6 = {
        "brand": "Apple",
        "model": "iPhone 13",
        "device_age_years": 1,
        "storage_gb": 128,
        "battery_condition": "Good",
        "problem_description": "Charge aagala."
    }
    res6 = client.post("/api/diagnose", json=payload6)
    assert res6.status_code == 200, f"Test 6 failed: {res6.text}"
    data6 = res6.json()
    nlp6 = data6.get("nlp_reasoning", {})
    symptom_ids6 = [s["symptom_id"] for s in nlp6.get("symptoms", [])]
    
    print(f"Detected Language: {nlp6.get('detected_language')}")
    print(f"Active Symptoms: {symptom_ids6}")
    
    assert "charging_failure" in symptom_ids6 or "not_charging" in symptom_ids6, f"Expected charging symptom in {symptom_ids6}"
    print(">>> TEST 6 PASSED!")

    # -------------------------------------------------------------------------
    # DEBUG ENDPOINT TEST: GET /api/diagnosis/debug/{diagnosis_id}
    # -------------------------------------------------------------------------
    diag_id = data1.get("diagnosis_id")
    print(f"\n--- TESTING DEBUG ENDPOINT: GET /api/diagnosis/debug/{diag_id} ---")
    debug_res = client.get(f"/api/diagnosis/debug/{diag_id}")
    assert debug_res.status_code == 200, f"Debug endpoint returned {debug_res.status_code}: {debug_res.text}"
    debug_data = debug_res.json()
    
    expected_fields = [
        "raw_user_input",
        "cleaned_user_input",
        "detected_language",
        "extracted_event",
        "extracted_active_symptoms",
        "extracted_negated_symptoms",
        "nlp_probable_issue",
        "nlp_affected_component",
        "gemini_probable_issue",
        "gemini_confirmed_issue",
        "gemini_confidence",
        "repair_price_status",
        "repair_price_evidence",
        "resale_price_status",
        "resale_price_range",
        "recycling_available",
        "priority_aligned_action"
    ]
    
    print("Debug response keys received:")
    for field in expected_fields:
        val = debug_data.get(field)
        safe_str = str(val).encode("ascii", "replace").decode("ascii")
        print(f"  {field}: {safe_str}")
        assert field in debug_data, f"Missing debug field: {field}"
        
    assert debug_data.get("gemini_confirmed_issue") is None, f"Expected gemini_confirmed_issue to be None, got {debug_data.get('gemini_confirmed_issue')}"
    print(">>> DEBUG ENDPOINT TEST PASSED (All 17 fields verified)!")
    
    print("\n==================================================")
    print("ALL 6 TESTS AND DEBUG VERIFICATION PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
