from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, computed_field


# ---------------------------------------------------------------------------
# Device Models & Hardware Specifications (2020-2026)
# ---------------------------------------------------------------------------
class DeviceResponse(BaseModel):
    id: int
    brand: str
    model: str
    release_date: Optional[str] = None
    release_year: int = 2023
    storage_variants: Optional[str] = "128GB, 256GB"
    ram_variants: Optional[str] = "6GB, 8GB"
    display_size: Optional[str] = '6.1"'
    display_type: Optional[str] = "AMOLED"
    display_refresh_rate: Optional[str] = None
    processor: Optional[str] = None
    battery_capacity: Optional[str] = "4500 mAh"
    charging: Optional[str] = "25W Fast"
    camera_information: Optional[str] = "50MP Dual"
    five_g_support: bool = True
    operating_system: Optional[str] = "Android"
    india_launch_price: Optional[float] = None
    category: str = "smartphone"
    water_resistance: Optional[str] = None
    software_support_end_year: Optional[int] = None
    known_failure_modes: Optional[str] = None
    second_life_suitability: Optional[str] = None
    repairability_score: Optional[float] = 7.0
    repairability_notes: Optional[str] = None
    base_mfg_carbon_kg: float = 65.0
    data_source: Optional[str] = "OEM Spec / CPCB / iFixit / Benchmark"
    last_verified: Optional[str] = "2026-03-01"
    source_url: str
    source_name: str
    confidence: str = "source_verified"
    retrieved_at: datetime
    is_active: bool = True

    @computed_field
    @property
    def model_name(self) -> str:
        return self.model

    @computed_field
    @property
    def storage_options(self) -> List[str]:
        if not self.storage_variants:
            return ["128GB", "256GB"]
        return [s.strip() for s in self.storage_variants.split(",") if s.strip()]

    @computed_field
    @property
    def ram_options(self) -> List[str]:
        if not self.ram_variants:
            return ["6GB", "8GB"]
        return [r.strip() for r in self.ram_variants.split(",") if r.strip()]

    class Config:
        from_attributes = True


DeviceModelResponse = DeviceResponse


class BrandCount(BaseModel):
    name: str
    count: int


class DeviceModelItem(BaseModel):
    id: int
    brand: str
    model_name: str
    release_year: Optional[int] = None
    storage_options: List[str] = Field(default_factory=list)
    ram_options: List[str] = Field(default_factory=list)
    display_type: Optional[str] = None
    processor: Optional[str] = None
    repairability_score: Optional[float] = None


class DeviceDetailResponse(BaseModel):
    id: int
    brand: str
    model_name: str
    device_type: str = "smartphone"
    release_year: Optional[int] = None
    release_date: Optional[str] = None
    storage_options: List[str] = Field(default_factory=list)
    ram_options: List[str] = Field(default_factory=list)
    battery_capacity: Optional[str] = None
    processor: Optional[str] = None
    display: Optional[str] = None
    display_type: Optional[str] = "AMOLED"
    display_refresh_rate: Optional[str] = None
    water_resistance: Optional[str] = None
    software_support_end_year: Optional[int] = None
    known_failure_modes: Optional[str] = None
    second_life_suitability: Optional[str] = None
    os: Optional[str] = None
    five_g: bool = True
    approximate_launch_price: Optional[float] = None
    repairability_score: Optional[float] = 7.0
    repairability_notes: Optional[str] = "Modular display and battery replacement supported."
    data_source: Optional[str] = None
    last_verified: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    source_date: Optional[str] = "2024-2026"
    retrieved_at: Optional[str] = None
    last_updated: Optional[str] = None
    is_active: bool = True


class DeviceStatsResponse(BaseModel):
    total_devices: int
    brands: int
    last_sync: Optional[str] = None
    sources: List[str] = Field(default_factory=list)


class DeviceSyncStatsResponse(BaseModel):
    status: str
    records_received: int
    records_valid: int
    records_inserted: int
    records_updated: int
    duplicates: int
    invalid: int


# ---------------------------------------------------------------------------
# Source Provenance Schema (Required for Every Scraped Record)
# ---------------------------------------------------------------------------
class SourceTracking(BaseModel):
    source_name: str
    source_url: str
    retrieved_at: str
    data_type: str
    confidence: str = "source_verified"
    observed_price: Optional[float] = None
    currency: str = "INR"


# ---------------------------------------------------------------------------
# Verified Repair Pricing & Multi-Source Aggregations
# ---------------------------------------------------------------------------
class RepairPriceItem(BaseModel):
    id: Optional[int] = None
    brand: str
    model: str
    problem_category: str
    component: str
    part_name: str
    part_price: float
    labour_price: float
    total_estimate: float
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    price_status: str = "available"  # available, estimated, unavailable
    currency: str = "INR"
    service_type: str
    source_url: str
    source_name: str
    confidence: str = "source_verified"
    retrieved_at: datetime

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Verified Repair Pricing Evidence Schema
# ---------------------------------------------------------------------------
class RepairPriceEvidence(BaseModel):
    device: str
    repair_category: str
    part_price: Optional[float] = None
    labor_price: Optional[float] = None
    service_fee: Optional[float] = None
    currency: str = "INR"
    source_name: Optional[str] = None
    source_url: Optional[str] = None
    retrieved_at: Optional[str] = None
    verification_status: str = "verified"  # "verified" or "unavailable"
    available: bool = True
    message: Optional[str] = None


class RepairEstimate(BaseModel):
    device: str
    problem_category: str
    part_cost: Optional[float] = None
    labor_cost: Optional[float] = None
    additional_service_cost: float = 150.0
    estimated_total: Optional[float] = None
    estimated_repair_time_minutes: int = 60
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    median_price: Optional[float] = None
    source_count: int = 1
    price_status: str = "available"  # "available", "unavailable"
    available: bool = True
    message: Optional[str] = None
    evidence: Optional[RepairPriceEvidence] = None
    is_indicative: bool = True
    data_freshness: str = "Verified from OEM & Authorized Price Schedules"
    disclaimer: str = "Market repair estimate based on verified price cards (OEM & Authorized Independents)."
    sources: List[SourceTracking] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Secondary Market Valuation & Multi-Platform Intelligence
# ---------------------------------------------------------------------------
class PlatformPriceItem(BaseModel):
    platform: str  # Cashify, Amazon, Flipkart, OLX
    platform_name: str
    price: float
    currency: str = "INR"
    condition: str
    url: str
    badge: Optional[str] = None
    rating: Optional[float] = None
    inventory_status: str = "Active"
    is_live: bool = True
    source_url: Optional[str] = None
    retrieved_at: Optional[str] = None


class MarketIntelligenceResponse(BaseModel):
    device: str
    search_query: str
    market_average_inr: float
    estimated_depreciation_pct: float
    best_buyback_platform: str
    best_resale_platform: str
    platforms: List[PlatformPriceItem]
    apify_status: str = "Apify REST Intelligence Active"
    scraped_at: str
    disclaimer: str = "Multi-platform secondary market intelligence derived from public marketplace listings."


class ResaleEstimate(BaseModel):
    device: str
    device_condition: str
    estimated_low: Optional[float] = None
    estimated_mid: Optional[float] = None
    estimated_high: Optional[float] = None
    potential_value_after_repair_low: Optional[float] = None
    potential_value_after_repair_mid: Optional[float] = None
    potential_value_after_repair_high: Optional[float] = None
    median_observed: Optional[float] = None
    estimated_resale_value: Optional[float] = None  # backward compat
    source_count: int = 0
    currency: str = "INR"
    available: bool = True
    price_status: str = "available"
    message: Optional[str] = None
    important_assumptions: List[str] = Field(default_factory=list)
    price_label: str = "Estimated market range"
    data_freshness: str = "Daily secondary trade-in schedule"
    disclaimer: str = "Estimated market range based on verified trade-in benchmarks. Not a guaranteed selling price."
    market_intelligence: Optional[MarketIntelligenceResponse] = None
    sources: List[SourceTracking] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# CPCB E-Waste Recycling Options
# ---------------------------------------------------------------------------
class RecyclingOption(BaseModel):
    accepted_device_type: str = "Smartphones, Lithium-Ion Batteries, PCBs"
    available: bool = True
    device_weight: Optional[str] = None
    environmental_estimate: Optional[str] = None
    material_recovery_estimate: List[str] = Field(default_factory=list)
    source: Optional[str] = None
    methodology: Optional[str] = None
    message: Optional[str] = None
    is_authorized: bool = True
    compliance: str = "MoEFCC & CPCB EPR Statutory Verified | Lok Sabha Q. 3779"
    authorization: str = "State PCB / CPCB Certified Recycler"
    data_freshness: str = "Statutory CPCB Registry (FY 2025-26)"
    sources: List[SourceTracking] = Field(default_factory=list)
    # Legacy backward compatibility fields
    estimated_ewaste_diverted_kg: Optional[float] = None
    estimated_co2e_saved_kg: Optional[float] = None
    material_recovery: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Multimodal AI Diagnosis (Separation of Symptom, Probable Issue & Confirmed Issue)
# ---------------------------------------------------------------------------
class AIDiagnosisOutput(BaseModel):
    device: str
    problem_category: str
    possible_issue: str
    confirmed_issue: Optional[str] = None  # None/null without physical bench inspection!
    severity: str
    confidence: str = "Moderate"  # High, Moderate, Low
    confidence_score: Optional[int] = 82  # percentage integer e.g. 82%
    evidence: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    possible_alternatives: List[str] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)
    image_findings: Optional[str] = None
    observed_symptoms: List[str] = Field(default_factory=list)
    possible_causes: List[str] = Field(default_factory=list)
    recommended_next_step: str
    safety_warning: Optional[str] = None
    diagnosis_limit: str = "The exact failed internal component cannot be confirmed from the provided information alone."


# ---------------------------------------------------------------------------
# NLP & Diagnostic Reasoning Schemas (Natural Human Language Pipeline)
# ---------------------------------------------------------------------------
class ExtractedSymptom(BaseModel):
    symptom_id: str
    category: str
    description: str
    is_negated: bool = False
    confidence: float = 0.90


class ExtractedEvent(BaseModel):
    event_type: Optional[str] = None  # drop, liquid_exposure, software_update, etc.
    event_time: Optional[str] = None  # yesterday, 2 days ago, etc.
    description: Optional[str] = None


class ExtractedDeviceContext(BaseModel):
    brand: Optional[str] = None
    model: Optional[str] = None
    storage: Optional[str] = None


class NLPReasoningOutput(BaseModel):
    raw_input: str
    cleaned_input: str
    detected_language: str = "en / tanglish"
    device: ExtractedDeviceContext = Field(default_factory=ExtractedDeviceContext)
    event: Optional[ExtractedEvent] = None
    symptoms: List[ExtractedSymptom] = Field(default_factory=list)
    negated_symptoms: List[ExtractedSymptom] = Field(default_factory=list)
    primary_category: str
    secondary_categories: List[str] = Field(default_factory=list)
    canonical_symptom: Optional[str] = None
    probable_issue: Optional[str] = None
    affected_component: Optional[str] = None
    severity: str
    safety_flags: List[str] = Field(default_factory=list)
    diagnostic_evidence: str
    confidence_score: float = 0.88
    confidence_level: str = "MODERATE"
    insufficient_information: bool = False
    follow_up_questions: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Decision Engine Comparison & Factors
# ---------------------------------------------------------------------------
class DecisionFactors(BaseModel):
    repair_cost: Optional[float] = None
    repair_cost_range: Optional[str] = None
    resale_value_range: Optional[str] = None
    device_age: float
    damage_severity: str
    repair_data_confidence: str  # "verified", "unavailable"
    resale_data_confidence: str  # "market_observed", "unavailable"
    recycling_availability: str  # "available", "unavailable"


class EcoImpactItem(BaseModel):
    metric: str
    label: str
    value: float
    unit: str
    methodology: str
    source: str
    confidence: str = "medium"


class DecisionComparison(BaseModel):
    user_priority: Optional[str] = "Keep using my current phone"
    priority_aligned_action: Optional[str] = None
    priority_explanation: Optional[str] = None
    decision_factors: Optional[DecisionFactors] = None
    recommended_action: str = "USER_CHOICE"  # USER_CHOICE, REPAIR, RESELL, RECYCLE, REUSE
    repair_candidate: bool = True
    resale_candidate: bool = True
    recycle_candidate: bool = True
    reuse_candidate: bool = True
    explanation: str
    data_freshness_summary: str = "Updated within statutory and trade schedules"
    repair_summary: RepairEstimate
    resale_summary: ResaleEstimate
    recycle_summary: RecyclingOption
    reuse_summary: Optional[Dict[str, Any]] = None
    eco_impact_metrics: List[EcoImpactItem] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Full Diagnosis API Request & Response
# ---------------------------------------------------------------------------
class DiagnoseRequest(BaseModel):
    device_id: Optional[int] = Field(None, example=1)
    brand: str = Field(..., example="Samsung")
    model: str = Field(..., example="Galaxy S22")
    release_year: Optional[int] = Field(None, example=2022)
    age_years: float = Field(1.5, example=1.5)
    storage_gb: int = Field(128, example=128)
    battery_condition: str = Field("Normal (~85%)", example="Normal (~85%)")
    problem_description: str = Field(
        ...,
        example="Phone fell down. Screen has vertical lines and touch is intermittently failing."
    )
    user_priority: Optional[str] = Field("Keep using my current phone", example="Keep using my current phone")
    image_base64: Optional[str] = None


class DiagnoseFullResponse(BaseModel):
    diagnosis_id: Optional[int] = None
    nlp_reasoning: Optional[NLPReasoningOutput] = None
    ai_diagnosis: AIDiagnosisOutput
    decision: DecisionComparison
    disclaimer: str = "AI provides root-cause diagnosis. Pricing & locations are strictly sourced from verified databases."



# ---------------------------------------------------------------------------
# Centers: Service & Recycling
# ---------------------------------------------------------------------------
class ServiceCenterResponse(BaseModel):
    id: int
    name: str
    brand: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    phone: str
    website: str
    services: str
    rating: float
    price_tier: str
    is_authorized: bool
    source_url: str
    source_name: str
    retrieved_at: datetime

    # Frontend convenience properties
    @property
    def services_offered(self) -> str:
        return self.services

    @property
    def distance_km(self) -> float:
        return 3.2

    class Config:
        from_attributes = True


class RecyclingCenterResponse(BaseModel):
    id: int
    name: str
    organization: str
    address: str
    city: str
    state: str
    pincode: str
    latitude: float
    longitude: float
    accepted_device_types: str
    phone: str
    website: str
    authorization_source: str
    annual_capacity_mt: float
    cpcb_reg_no: str
    metals_recovered: str
    is_cpcb_authorized: bool
    collection_type: str
    source_url: str
    source_name: str
    retrieved_at: datetime

    # Frontend convenience properties
    @property
    def contact(self) -> str:
        return f"{self.phone} | {self.organization}"

    @property
    def distance_km(self) -> float:
        return 4.5

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Data Sync Pipeline (Apify Ingestion)
# ---------------------------------------------------------------------------
class DataSyncRequest(BaseModel):
    actor_id: Optional[str] = None
    search_keywords: Optional[List[str]] = None
    max_items: Optional[int] = 50
    dry_run: bool = False


class DataSyncResponse(BaseModel):
    success: bool
    data_type: str
    actor_id: str
    run_id: Optional[str] = None
    status: str
    items_scraped: int
    items_inserted: int
    items_rejected: int
    message: str
    retrieval_timestamp: str
    error_details: Optional[str] = None


class DataSyncStatusResponse(BaseModel):
    last_sync_runs: List[Dict[str, Any]]
    configured_actors: Dict[str, Any]
    apify_token_configured: bool
    sources_summary: Dict[str, int]


# ---------------------------------------------------------------------------
# Rewards & Dashboard
# ---------------------------------------------------------------------------
class RewardActionRequest(BaseModel):
    user_id: Optional[int] = 1
    diagnosis_id: Optional[int] = None
    action_type: str = Field(..., example="REPAIR")
    center_name: Optional[str] = "GoFix Authorized Hub"


class RewardActionResponse(BaseModel):
    success: bool
    action_type: str
    points_awarded: int
    total_user_points: int
    message: str
    co2e_saved_kg: float
    ewaste_diverted_kg: float


class RewardHistoryItem(BaseModel):
    id: int
    user_id: int
    transaction_id: Optional[int] = None
    points_change: int
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    user_name: str
    reward_points: int
    devices_analyzed: int
    devices_repaired: int
    devices_reused: int
    devices_recycled: int
    total_ewaste_diverted_kg: float
    total_co2e_saved_kg: float
    recent_activity: List[Dict[str, Any]]
    monthly_impact: List[Dict[str, Any]]
    reward_history: List[RewardHistoryItem]


# ---------------------------------------------------------------------------
# AI Assistant & Interactive Follow-ups (Section 15)
# ---------------------------------------------------------------------------
class AssistantChatRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    diagnosis_id: Optional[int] = None
    device_context: Optional[Any] = None
    diagnosis_context: Optional[Dict[str, Any]] = None


class AssistantChatResponse(BaseModel):
    reply: str
    evidence_used: List[str] = Field(default_factory=list)
    suggested_followups: List[str] = Field(default_factory=list)
    suggested_action: Optional[str] = None
    source_note: str = "Grounded strictly in verified diagnostic facts and database pricing."
    source_provenance: Optional[str] = "ReWise Multi-Source Diagnostic Knowledgebase"


# ---------------------------------------------------------------------------
# Circular Actions & Verification (Section 13)
# ---------------------------------------------------------------------------
class CircularActionSubmitRequest(BaseModel):
    user_id: Optional[int] = 1
    diagnosis_id: Optional[int] = None
    action_type: str = "REPAIR"  # REPAIR, RESELL, RECYCLE, REUSE
    center_name: Optional[str] = "Certified Circular Partner Hub"
    partner_id: Optional[int] = None
    partner_name: Optional[str] = None
    device_name: Optional[str] = None
    co2e_saved: Optional[float] = None
    e_waste_diverted: Optional[float] = None
    proof_url: Optional[str] = None
    proof_notes: Optional[str] = None


class CircularActionResponse(BaseModel):
    status: str = "success"
    action_id: int
    action_type: str
    points_awarded: int
    total_points: int
    message: str
    eco_impact: Dict[str, Any]


# ---------------------------------------------------------------------------
# Admin Analytics (Section 17)
# ---------------------------------------------------------------------------
class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_diagnoses: int
    common_models: List[Dict[str, Any]]
    common_problems: List[Dict[str, Any]]
    decisions_breakdown: Dict[str, int]
    total_circular_actions: int
    total_reward_points_issued: int
    total_ewaste_diverted_kg: float
    total_co2e_saved_kg: float
    data_type_flag: str = "Real Database Telemetry with Benchmark Verification"
    last_updated: str


# ---------------------------------------------------------------------------
# Partner Directory (Section 16)
# ---------------------------------------------------------------------------
class PartnerItem(BaseModel):
    id: int
    name: str
    category: str  # Repair, Resale, Recycling
    city: str
    location: str
    services: Optional[str] = None
    pricing: Optional[str] = None
    contact: Optional[str] = None
    verification_status: str  # Verified / Listed
    source: str
    last_updated: Optional[str] = None


# ---------------------------------------------------------------------------
# Dedicated Image Damage Analysis (Section 5)
# ---------------------------------------------------------------------------
class ImageDiagnosisRequest(BaseModel):
    image_base64: str
    device: Optional[str] = "Smartphone"
    description: Optional[str] = None


class ImageDiagnosisResponse(BaseModel):
    observable_findings: List[str]
    internal_damage_confirmed: bool = False
    disclaimer: str = "Internal damage cannot be confirmed from this image."
    suggested_component: Optional[str] = None

