import type {
  DeviceModel,
  Device,
  BrandCount,
  DeviceModelItem,
  DeviceStats,
  DeviceSyncStats,
  DiagnoseFullResponse,
  RepairEstimate,
  ResaleEstimate,
  MarketIntelligenceResponse,
  ServiceCenter,
  RecyclingCenter,
  RewardActionResponse,
  DashboardSummary,
  AssistantChatResponse,
  AdminAnalytics,
  PartnerItem,
  CircularActionResponse,
} from "../types";

const API_BASE = "http://127.0.0.1:8000/api";

export interface DiagnosePayload {
  device_id?: number;
  brand: string;
  model: string;
  release_year?: number;
  age_years: number;
  storage_gb: number;
  battery_condition: string;
  problem_description: string;
  user_priority?: string;
  image_base64?: string;
}

export const api = {
  async getBrands(): Promise<BrandCount[]> {
    const res = await fetch(`${API_BASE}/devices/brands`);
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
  },

  async getDeviceModels(brand: string): Promise<DeviceModelItem[]> {
    const res = await fetch(`${API_BASE}/devices/models?brand=${encodeURIComponent(brand)}`);
    if (!res.ok) throw new Error("Failed to fetch models");
    return res.json();
  },

  async searchDevices(query: string, brand?: string): Promise<DeviceModelItem[]> {
    const params = new URLSearchParams({ q: query });
    if (brand) params.set("brand", brand);
    const res = await fetch(`${API_BASE}/devices/search?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search devices");
    return res.json();
  },

  async getDevice(deviceId: number | string): Promise<Device> {
    const res = await fetch(`${API_BASE}/devices/${deviceId}`);
    if (!res.ok) throw new Error("Failed to fetch device details");
    return res.json();
  },

  async getDeviceStats(): Promise<DeviceStats> {
    const res = await fetch(`${API_BASE}/devices/stats`);
    if (!res.ok) throw new Error("Failed to fetch device stats");
    return res.json();
  },

  async syncDevices(actorId?: string): Promise<DeviceSyncStats> {
    const res = await fetch(`${API_BASE}/data-sync/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actorId ? { actor_id: actorId } : {}),
    });
    if (!res.ok) throw new Error("Failed to sync devices");
    return res.json();
  },

  async getDevices(brand?: string): Promise<DeviceModel[]> {
    const url = brand ? `${API_BASE}/devices?brand=${encodeURIComponent(brand)}` : `${API_BASE}/devices`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch devices");
    return res.json();
  },

  async diagnose(payload: DiagnosePayload): Promise<DiagnoseFullResponse> {
    const res = await fetch(`${API_BASE}/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Diagnosis failed");
    }
    return res.json();
  },

  async getRepairEstimate(brand: string, model: string, category: string): Promise<RepairEstimate> {
    const res = await fetch(
      `${API_BASE}/repair-estimate?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(
        model
      )}&category=${encodeURIComponent(category)}`
    );
    if (!res.ok) throw new Error("Failed to fetch repair estimate");
    return res.json();
  },

  async getResaleEstimate(
    brand: string,
    model: string,
    age: number,
    storage: number,
    severity: string
  ): Promise<ResaleEstimate> {
    const res = await fetch(
      `${API_BASE}/resale-estimate?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(
        model
      )}&age_years=${age}&storage_gb=${storage}&severity=${encodeURIComponent(severity)}`
    );
    if (!res.ok) throw new Error("Failed to fetch resale estimate");
    return res.json();
  },

  async getMarketPrices(brand: string, model: string, storage: number = 128): Promise<MarketIntelligenceResponse> {
    const res = await fetch(
      `${API_BASE}/market-prices?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(
        model
      )}&storage_gb=${storage}`
    );
    if (!res.ok) throw new Error("Failed to fetch live market intelligence");
    return res.json();
  },

  async getServiceCenters(city?: string): Promise<ServiceCenter[]> {
    const url = city ? `${API_BASE}/service-centers?city=${encodeURIComponent(city)}` : `${API_BASE}/service-centers`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch service centers");
    return res.json();
  },

  async getRecyclingCenters(city?: string): Promise<RecyclingCenter[]> {
    const url = city
      ? `${API_BASE}/recycling-centers?city=${encodeURIComponent(city)}`
      : `${API_BASE}/recycling-centers`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch recycling centers");
    return res.json();
  },

  async claimReward(actionType: string, diagnosisId?: number, centerName?: string): Promise<RewardActionResponse> {
    const res = await fetch(`${API_BASE}/rewards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action_type: actionType,
        diagnosis_id: diagnosisId,
        center_name: centerName,
      }),
    });
    if (!res.ok) throw new Error("Failed to award points");
    return res.json();
  },

  async getDashboard(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
  },

  async chatWithAssistant(
    query: string,
    diagnosisId?: number,
    deviceContext?: Record<string, any>
  ): Promise<AssistantChatResponse> {
    const res = await fetch(`${API_BASE}/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        diagnosis_id: diagnosisId,
        device_context: deviceContext,
      }),
    });
    if (!res.ok) throw new Error("Failed to get assistant response");
    return res.json();
  },

  async recordCircularAction(payload: {
    action_type: string;
    diagnosis_id?: number;
    device_name?: string;
    partner_id?: number;
    partner_name?: string;
    co2e_saved?: number;
    e_waste_diverted?: number;
    proof_notes?: string;
  }): Promise<CircularActionResponse> {
    const res = await fetch(`${API_BASE}/circular-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to record circular action");
    }
    return res.json();
  },

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${API_BASE}/admin/analytics`);
    if (!res.ok) throw new Error("Failed to fetch admin analytics");
    return res.json();
  },

  async getPartners(city?: string, partnerType?: string): Promise<PartnerItem[]> {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (partnerType) params.set("partner_type", partnerType);
    const url = `${API_BASE}/partners?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch partners");
    return res.json();
  },

  async getRewardsOverview(): Promise<{ total_points: number; total_actions: number; history: any[] }> {
    const res = await fetch(`${API_BASE}/rewards`);
    if (!res.ok) throw new Error("Failed to fetch rewards history");
    return res.json();
  },

  async analyzeImageDamage(imageBase64: string): Promise<any> {
    const res = await fetch(`${API_BASE}/diagnose/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    if (!res.ok) throw new Error("Failed to analyze damage image");
    return res.json();
  },
};

