export interface DeviceModel {
  id: number;
  brand: string;
  model_name: string;
  release_year: number;
  category: string;
  base_mfg_carbon_kg: number;
}

export interface AIDiagnosisOutput {
  device: string;
  problem_category: string;
  possible_issue: string;
  confirmed_issue?: string | null;
  severity: "Minor" | "Moderate" | "Critical" | string;
  confidence: string;
  confidence_score?: number;
  evidence?: string[];
  missing_information?: string[];
  possible_alternatives?: string[];
  follow_up_questions?: string[];
  image_findings?: string | null;
  observed_symptoms: string[];
  possible_causes: string[];
  recommended_next_step: string;
  safety_warning?: string | null;
  diagnosis_limit?: string;
}

export interface SourceTracking {
  source_name: string;
  source_url: string;
  retrieved_at: string;
  data_type: string;
  confidence: string;
  observed_price?: number;
  currency: string;
}

export interface RepairPriceEvidence {
  device: string;
  repair_category: string;
  part_price?: number | null;
  labor_price?: number | null;
  service_fee?: number | null;
  currency: string;
  source_name?: string | null;
  source_url?: string | null;
  retrieved_at?: string | null;
  verification_status: string;
  available: boolean;
  message?: string | null;
}

export interface RepairEstimate {
  device: string;
  problem_category: string;
  part_cost?: number | null;
  labor_cost?: number | null;
  additional_service_cost?: number;
  estimated_total?: number | null;
  estimated_repair_time_minutes?: number;
  price_min?: number | null;
  price_max?: number | null;
  median_price?: number | null;
  source_count?: number;
  available?: boolean;
  price_status?: string;
  message?: string | null;
  evidence?: RepairPriceEvidence;
  data_freshness?: string;
  is_indicative: boolean;
  disclaimer: string;
  sources?: SourceTracking[];
}

export interface PlatformPriceItem {
  platform: string;
  platform_name: string;
  price: number;
  currency: string;
  condition: string;
  url: string;
  badge?: string;
  rating?: number;
  inventory_status: string;
  is_live: boolean;
}

export interface MarketIntelligenceResponse {
  device: string;
  search_query: string;
  market_average_inr: number;
  estimated_depreciation_pct: number;
  best_buyback_platform: string;
  best_resale_platform: string;
  platforms: PlatformPriceItem[];
  apify_status: string;
  scraped_at: string;
  disclaimer: string;
}

export interface ResaleEstimate {
  device: string;
  device_condition: string;
  estimated_low?: number | null;
  estimated_mid?: number | null;
  estimated_high?: number | null;
  potential_value_after_repair_low?: number | null;
  potential_value_after_repair_mid?: number | null;
  potential_value_after_repair_high?: number | null;
  median_observed?: number | null;
  estimated_resale_value?: number | null;
  source_count?: number;
  currency: string;
  available?: boolean;
  price_status?: string;
  message?: string | null;
  price_label?: string;
  data_freshness?: string;
  important_assumptions: string[];
  disclaimer: string;
  market_intelligence?: MarketIntelligenceResponse;
  sources?: SourceTracking[];
}

export interface RecyclingOption {
  accepted_device_type: string;
  available?: boolean;
  device_weight?: string | null;
  environmental_estimate?: string | null;
  material_recovery_estimate?: string[];
  source?: string | null;
  methodology?: string | null;
  message?: string | null;
  is_authorized?: boolean;
  compliance?: string;
  authorization?: string;
  data_freshness?: string;
  estimated_ewaste_diverted_kg?: number;
  estimated_co2e_saved_kg?: number;
  material_recovery?: string[];
  sources?: SourceTracking[];
}

export interface EcoImpactItem {
  metric: string;
  label?: string;
  value: number;
  unit: string;
  methodology?: string;
  source?: string;
  description?: string;
  methodology_source?: string;
  confidence?: string;
}

export interface DecisionFactors {
  repair_cost?: number | null;
  repair_cost_range?: string | null;
  resale_value_range?: string | null;
  device_age: number;
  damage_severity: string;
  repair_data_confidence: string;
  resale_data_confidence: string;
  recycling_availability: string;
}

export interface DecisionComparison {
  user_priority?: string;
  priority_aligned_action?: string;
  priority_explanation?: string;
  decision_factors?: DecisionFactors;
  recommended_action: "REPAIR" | "RESELL" | "RECYCLE" | "USER_CHOICE" | string;
  repair_candidate: boolean;
  resale_candidate: boolean;
  recycle_candidate: boolean;
  reuse_candidate?: boolean;
  explanation: string;
  data_freshness_summary?: string;
  repair_summary: RepairEstimate;
  resale_summary: ResaleEstimate;
  recycle_summary: RecyclingOption;
  reuse_summary?: {
    eligible: boolean;
    title?: string;
    possible_uses?: string[];
    repurpose_ideas?: string[];
    refurbish_potential?: string;
    suggested_action?: string;
    difficulty?: string;
    hardware_status?: string;
    data_sanitization?: string;
    notes?: string;
  };
  eco_impact?: EcoImpactItem[];
  eco_impact_metrics?: EcoImpactItem[];
}

export interface ExtractedSymptom {
  symptom_id: string;
  category: string;
  description: string;
  is_negated: boolean;
  confidence: number;
}

export interface ExtractedEvent {
  event_type?: string | null;
  event_time?: string | null;
  description?: string | null;
}

export interface ExtractedDeviceContext {
  brand?: string | null;
  model?: string | null;
  storage?: string | null;
}

export interface NLPReasoningOutput {
  raw_input: string;
  cleaned_input: string;
  detected_language: string;
  device: ExtractedDeviceContext;
  event?: ExtractedEvent | null;
  symptoms: ExtractedSymptom[];
  negated_symptoms: ExtractedSymptom[];
  primary_category: string;
  secondary_categories: string[];
  canonical_symptom?: string | null;
  probable_issue?: string | null;
  affected_component?: string | null;
  severity: string;
  safety_flags: string[];
  diagnostic_evidence: string;
  confidence_score: number;
  confidence_level?: string;
  insufficient_information?: boolean;
  follow_up_questions?: string[];
}

export interface DiagnoseFullResponse {
  diagnosis_id: number | null;
  nlp_reasoning?: NLPReasoningOutput;
  ai_diagnosis: AIDiagnosisOutput;
  device?: {
    brand?: string;
    model?: string;
    device_id?: number;
  };
  disclaimer: string;
  decision: DecisionComparison;
}

export interface ServiceCenter {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance_km: number;
  phone: string;
  rating: number;
  services_offered: string;
  price_tier: string;
  is_authorized: boolean;
}

export interface RecyclingCenter {
  id: number;
  name: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance_km: number;
  contact: string;
  accepted_device_types: string;
  is_cpcb_authorized: boolean;
  collection_type: string;
  annual_capacity_mt?: number;
  cpcb_reg_no?: string;
  metals_recovered?: string;
}

export interface RewardActionResponse {
  success: boolean;
  action_type: string;
  points_awarded: number;
  total_user_points: number;
  message: string;
  co2e_saved_kg: number;
  ewaste_diverted_kg: number;
}

export interface RewardHistoryItem {
  id: number;
  points_change: number;
  reason: string;
  created_at: string;
}

export interface DashboardSummary {
  user_name: string;
  reward_points: number;
  devices_analyzed: number;
  devices_repaired: number;
  devices_reused: number;
  devices_recycled: number;
  total_ewaste_diverted_kg: number;
  total_co2e_saved_kg: number;
  recent_activity: Array<{ action: string; device: string; points: string; date: string }>;
  monthly_impact: Array<{ month: string; co2e_saved: number; ewaste_kg: number; points: number }>;
  reward_history: RewardHistoryItem[];
}

export interface AssistantChatResponse {
  reply: string;
  evidence_used?: string[];
  suggested_followups?: string[];
  suggested_action?: string;
  source_note?: string;
  source_provenance?: string;
}

export interface AdminAnalytics {
  total_users?: number;
  total_diagnoses: number;
  total_circular_actions: number;
  total_reward_points_issued?: number;
  total_points_awarded?: number;
  total_ewaste_diverted_kg: number;
  total_co2e_saved_kg: number;
  data_type_flag?: string;
  last_updated?: string;
  action_breakdown?: Record<string, number>;
  decisions_breakdown?: Record<string, number>;
  common_models?: Array<{ device: string; diagnoses: number }>;
  top_diagnosed_models?: Array<{ model: string; count: number }>;
  common_problems?: Array<{ category: string; count: number }>;
  recent_actions?: Array<{
    id: number;
    action_type: string;
    device_name?: string;
    partner_name?: string;
    co2e_saved?: number;
    points_awarded: number;
    created_at: string;
  }>;
}

export interface PartnerItem {
  id: number;
  name: string;
  category?: string;
  partner_type?: string;
  city: string;
  location?: string;
  address?: string;
  services?: string;
  pricing?: string;
  contact?: string;
  verification_status?: string;
  is_verified?: boolean;
  source?: string;
  last_updated?: string;
}

export interface CircularActionResponse {
  status: string;
  action_id: number;
  action_type: string;
  points_awarded: number;
  total_points: number;
  total_user_points?: number;
  message: string;
  co2e_saved_kg?: number;
  ewaste_diverted_kg?: number;
  eco_impact?: {
    co2e_saved_kg: number;
    ewaste_diverted_kg: number;
    methodology: string;
  };
}

export * from "./device";

