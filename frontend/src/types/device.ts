export interface Device {
  id: number;
  brand: string;
  model_name: string;
  release_year?: number;
  release_date?: string;
  storage_options?: string[];
  ram_options?: string[];
  battery_capacity?: string;
  processor?: string;
  display?: string;
  os?: string;
  five_g?: boolean;
  display_type?: string;
  display_refresh_rate?: string;
  water_resistance?: string;
  software_support_end_year?: number;
  repairability_score?: number;
  repairability_notes?: string;
  known_failure_modes?: string;
  second_life_suitability?: string;
  data_source?: string;
  last_verified?: string;
  source?: string;
  source_name?: string;
  source_url?: string;
  retrieved_at?: string;
  is_active?: boolean;
}

export interface BrandCount {
  name: string;
  count: number;
}

export interface DeviceModelItem {
  id: number;
  brand: string;
  model_name: string;
  release_year?: number;
}

export interface DeviceStats {
  total_devices: number;
  brands: number;
  last_sync?: string;
  sources: string[];
}

export interface DeviceSyncStats {
  status: string;
  records_received: number;
  records_valid: number;
  records_inserted: number;
  records_updated: number;
  duplicates: number;
  invalid: number;
}
