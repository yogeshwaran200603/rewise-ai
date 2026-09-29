import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from app.services.nlp_service import NLPReasoningService


def test_1_drop_display_lines():
    """Test 1: Drop event + visible display vertical / black lines."""
    text = "My phone fell down yesterday and display has black lines."
    output = NLPReasoningService.analyze(text)
    
    assert output.event is not None
    assert output.event.event_type == "drop"
    symptom_ids = [s.symptom_id for s in output.symptoms]
    assert any("line" in s or "screen" in s for s in symptom_ids)
    assert output.primary_category in ["Display", "Display/Touch"]


def test_2_drop_touch_failure():
    """Test 2: Drop event + touch not working."""
    text = "Phone fell down onto concrete and touch is not working at all."
    output = NLPReasoningService.analyze(text)
    
    assert output.event is not None
    assert output.event.event_type == "drop"
    symptom_ids = [s.symptom_id for s in output.symptoms]
    assert any("touch" in s for s in symptom_ids)
    assert output.primary_category in ["Display/Touch", "Display"]


def test_3_battery_drain():
    """Test 3: Rapid battery discharge / drain."""
    text = "Battery drains very fast and percentage drops suddenly."
    output = NLPReasoningService.analyze(text)
    
    symptom_ids = [s.symptom_id for s in output.symptoms]
    assert any("drain" in s or "battery" in s for s in symptom_ids)
    assert output.primary_category == "Battery"


def test_4_charging_overheating():
    """Test 4: Phone heating or overheating during charging."""
    text = "Device gets extremely hot while charging."
    output = NLPReasoningService.analyze(text)
    
    symptom_ids = [s.symptom_id for s in output.symptoms]
    assert any("heat" in s or "charg" in s for s in symptom_ids)
    assert output.primary_category in ["Charging", "Battery"]


def test_5_water_damage():
    """Test 5: Liquid exposure / dropped in water."""
    text = "Phone fell into water yesterday and got wet."
    output = NLPReasoningService.analyze(text)
    
    assert output.event is not None
    assert output.event.event_type == "liquid_exposure"
    assert output.primary_category == "Water damage"


def test_6_camera_failure():
    """Test 6: Camera black screen or not opening."""
    text = "Camera app shows black screen when opened."
    output = NLPReasoningService.analyze(text)
    
    symptom_ids = [s.symptom_id for s in output.symptoms]
    assert any("camera" in s for s in symptom_ids)
    assert output.primary_category == "Camera"


def test_7_tanglish_input():
    """Test 7: Colloquial Tanglish input normalizes correctly."""
    text = "phone keela vizhunthuchu display line varuthu touch work aagala"
    output = NLPReasoningService.analyze(text)
    
    assert output.event is not None
    assert output.event.event_type == "drop"
    symptom_ids = [s.symptom_id for s in output.symptoms]
    assert any("line" in s for s in symptom_ids)
    assert any("touch" in s for s in symptom_ids)


def test_8_negation_display_fine_touch_broken():
    """
    Test 8: Strict Negation Handling.
    Input: 'Display is fine but touch is not working.'
    Expected:
    - touch is active failure
    - display damage is negated (display is intact)
    - must NOT diagnose display glass fracture as active symptom!
    """
    text = "Display is fine but touch is not working."
    output = NLPReasoningService.analyze(text)
    
    active_symptoms = [s.symptom_id for s in output.symptoms]
    negated_symptoms = [s.symptom_id for s in output.negated_symptoms]
    
    # Touch failure MUST be active
    assert any("touch" in s for s in active_symptoms)
    
    # Display must be recognized as negated / intact or NOT present in active failure
    assert not any(s in ["cracked_screen", "broken_glass"] for s in active_symptoms)
    assert output.primary_category in ["Display/Touch", "Display"]


if __name__ == "__main__":
    test_1_drop_display_lines()
    test_2_drop_touch_failure()
    test_3_battery_drain()
    test_4_charging_overheating()
    test_5_water_damage()
    test_6_camera_failure()
    test_7_tanglish_input()
    test_8_negation_display_fine_touch_broken()
    print("All 8 diagnostic test cases passed successfully!")
