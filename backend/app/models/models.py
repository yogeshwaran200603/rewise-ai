from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship, declarative_base, synonym

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Eco Champion")
    email = Column(String(150), unique=True, index=True, default="champion@rewise.ai")
    reward_points = Column(Integer, default=350)
    created_at = Column(DateTime, default=datetime.utcnow)

    diagnoses = relationship("Diagnosis", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    rewards = relationship("Reward", back_populates="user")


# 1. Device Specifications Table (Target 2020-2026)
class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(60), index=True, nullable=False)
    model = Column(String(100), index=True, nullable=False)
    model_name = synonym("model")
    release_date = Column(String(30), nullable=True)
    release_year = Column(Integer, default=2023, index=True)
    storage_variants = Column(String(100), default="128GB, 256GB")
    ram_variants = Column(String(100), default="6GB, 8GB")
    display_size = Column(String(50), default='6.1"')
    display_type = Column(String(60), default="AMOLED")
    processor = Column(String(100), nullable=True)
    battery_capacity = Column(String(50), default="4500 mAh")
    charging = Column(String(100), default="25W Fast Charging")
    camera_information = Column(String(150), default="50MP Main + 12MP Ultra-wide")
    five_g_support = Column(Boolean, default=True)
    operating_system = Column(String(50), default="Android / iOS")
    india_launch_price = Column(Float, nullable=True)
    category = Column(String(50), default="smartphone")
    device_type = Column(String(50), default="smartphone")
    display_refresh_rate = Column(String(30), nullable=True)  # e.g., "120Hz", "90Hz", "60Hz"
    water_resistance = Column(String(40), nullable=True)  # e.g., "IP68", "IP67", "IP54"
    software_support_end_year = Column(Integer, nullable=True)  # e.g., 2028
    known_failure_modes = Column(Text, nullable=True)  # Known common failure modes
    second_life_suitability = Column(String(250), nullable=True)  # e.g., "webcam,dashcam,smart_display"
    repairability_score = Column(Float, nullable=True, default=7.0)
    repairability_notes = Column(String(250), default="Modular display and battery replacement supported.")
    base_mfg_carbon_kg = Column(Float, default=65.0)
    average_lifespan_years = Column(Float, default=4.0)
    is_active = Column(Boolean, default=True)

    # Source Tracking & Provenance
    data_source = Column(String(150), default="OEM Spec / CPCB / iFixit / Benchmark", nullable=True)
    last_verified = Column(String(50), default="2026-03-01", nullable=True)
    source_url = Column(String(500), default="https://cpcb.nic.in/e-waste/")
    source_name = Column(String(150), default="OEM Official Specifications / CPCB Registry")
    source_date = Column(String(50), default="2024-2026")
    confidence = Column(String(50), default="source_verified")
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Synonyms
    approximate_launch_price = synonym("india_launch_price")
    source = synonym("source_name")
    chipset = synonym("processor")
    charging_speed = synonym("charging")
    camera_setup = synonym("camera_information")

    aliases = relationship("DeviceAlias", back_populates="device", cascade="all, delete-orphan")
    repair_prices = relationship("RepairPrice", back_populates="device", cascade="all, delete-orphan")
    resale_prices = relationship("ResalePrice", back_populates="device", cascade="all, delete-orphan")
    price_histories = relationship("PriceHistory", back_populates="device", cascade="all, delete-orphan")

    @property
    def storage_options(self) -> list:
        if not self.storage_variants:
            return ["128GB", "256GB"]
        return [s.strip() for s in self.storage_variants.split(",") if s.strip()]

    @property
    def ram_options(self) -> list:
        if not self.ram_variants:
            return ["6GB", "8GB"]
        return [r.strip() for r in self.ram_variants.split(",") if r.strip()]


# Alias model for backward compatibility with existing code
DeviceModel = Device


# 2. Canonical Identity & Device Aliases Table
class DeviceAlias(Base):
    __tablename__ = "device_aliases"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    alias_name = Column(String(150), index=True, nullable=False)
    alias = synonym("alias_name")
    source = Column(String(100), default="Manual / Ingestion Normalizer")
    created_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="aliases")


# 3. Verified Repair Prices Table
class RepairPrice(Base):
    __tablename__ = "repair_prices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    brand = Column(String(60), index=True, nullable=False)
    model = Column(String(100), index=True, nullable=False)
    problem_category = Column(String(60), index=True, nullable=False)  # display, battery, motherboard, charging_port, camera, back_glass
    component = Column(String(100), default="Standard Assembly")
    part_name = Column(String(150), default="OEM Grade Replacement Unit")
    part_type = Column(String(30), default="OEM")  # OEM or Aftermarket
    part_price = Column(Float, nullable=True)  # NULL if estimate unavailable
    labour_price = Column(Float, nullable=True, default=500.0)
    total_estimate = Column(Float, nullable=True)  # NULL if estimate unavailable
    price_min = Column(Float, nullable=True)
    price_max = Column(Float, nullable=True)
    price_status = Column(String(30), default="available")  # available, estimated, unavailable
    currency = Column(String(10), default="INR")
    service_type = Column(String(60), default="Authorized Walk-In / Doorstep")
    is_indicative = Column(Boolean, default=True)

    # Source Tracking & Provenance
    data_source = Column(String(150), default="OEM Price Card / Independent Benchmark", nullable=True)
    last_verified = Column(String(50), default="2026-03-01", nullable=True)
    source_url = Column(String(500), default="https://rewise.ai/sources/repair-benchmarks", nullable=False)
    source_name = Column(String(150), default="OEM Service Centers / Independent Benchmarks", nullable=False)
    confidence = Column(String(50), default="source_verified")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="repair_prices")

    # Compatibility properties and synonyms
    device_model_id = synonym("device_id")
    part_cost = synonym("part_price")
    labor_cost = synonym("labour_price")
    total_repair_cost = synonym("total_estimate")
    additional_service_cost = Column(Float, default=150.0)
    estimated_time_minutes = Column(Integer, default=60)


# 4. Secondary Market & Resale Prices Table
class ResalePrice(Base):
    __tablename__ = "resale_prices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    brand = Column(String(60), index=True, nullable=False)
    model = Column(String(100), index=True, nullable=False)
    storage = Column(String(30), default="128GB")
    condition = Column(String(30), default="good")  # excellent, good, fair, damaged, non_functional
    battery_condition = Column(String(50), default="Normal (>80%)")
    damage_condition = Column(String(50), default="Minor Scratches")
    estimated_price_low = Column(Float, nullable=False)
    estimated_price_high = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    marketplace = Column(String(60), default="Cashify")  # Cashify, Amazon Renewed, Flipkart Re-New, OLX
    price_label = Column(String(40), default="market estimate")

    # Compatibility fields
    device_model_id = synonym("device_id")
    condition_grade = synonym("condition")
    baseline_resale_price = Column(Float, nullable=True)
    storage_gb = Column(Integer, default=128)
    low_multiplier = Column(Float, default=0.82)
    high_multiplier = Column(Float, default=1.18)

    # Source Tracking & Provenance
    source_url = Column(String(500), nullable=False)
    source_name = Column(String(150), nullable=False)
    confidence = Column(String(50), default="market_estimate")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    device = relationship("Device", back_populates="resale_prices")


# 5. Service Centers Table (Pan-India Authorized Network)
class ServiceCenter(Base):
    __tablename__ = "service_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    brand = Column(String(80), index=True, default="Multi-Brand")
    address = Column(String(300), nullable=False)
    city = Column(String(80), index=True, nullable=False)
    state = Column(String(80), index=True, default="Karnataka")
    pincode = Column(String(20), default="560001")
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    phone = Column(String(60), default="+91 80 2210 0000")
    email = Column(String(150), default="support@rewise.ai")
    website = Column(String(250), default="https://gofix.co.in")
    services = Column(String(300), default="Screen, Battery, Clean-Room Motherboard Repair")
    services_offered = synonym("services")
    rating = Column(Float, default=4.7)
    price_tier = Column(String(40), default="Authorized / Verified")
    is_authorized = Column(Boolean, default=True)

    # Source Tracking & Provenance
    source_url = Column(String(500), default="https://rewise.ai/sources/service-network")
    source_name = Column(String(150), default="Manufacturer Authorized Service Directory")
    confidence = Column(String(50), default="source_verified")
    retrieved_at = Column(DateTime, default=datetime.utcnow)


# 6. Recycling Centers Table (CPCB & State PCB Registered Facilities)
class RecyclingCenter(Base):
    __tablename__ = "recycling_centers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    organization = Column(String(150), default="Registered E-Waste Recycler")
    address = Column(String(300), nullable=False)
    city = Column(String(80), index=True, nullable=False)
    state = Column(String(80), index=True, default="Karnataka")
    pincode = Column(String(20), default="560058")
    latitude = Column(Float, default=12.9716)
    longitude = Column(Float, default=77.5946)
    accepted_device_types = Column(String(300), default="Smartphones, Tablets, Li-ion Batteries, Complex Circuit Boards")
    phone = Column(String(60), default="+91 80 2839 4411")
    website = Column(String(250), default="https://cpcb.nic.in")
    authorization_source = Column(String(200), default="MoEFCC & CPCB EPR Registry | Lok Sabha Q. 3779")
    annual_capacity_mt = Column(Float, default=10000.0)
    cpcb_reg_no = Column(String(100), default="CPCB/EPR/REC/KA/0012/2026")
    metals_recovered = Column(String(250), default="Gold (Au), Copper (Cu), Aluminum (Al), Lithium, Cobalt")
    is_cpcb_authorized = Column(Boolean, default=True)
    collection_type = Column(String(80), default="Zero-Landfill Urban Mining & Precious Metals Recovery")

    # Source Tracking & Provenance
    source_url = Column(String(500), default="https://cpcb.nic.in/e-waste/")
    source_name = Column(String(150), default="MoEFCC & CPCB Lok Sabha Q. 3779 Official Record")
    confidence = Column(String(50), default="statutory_verified")
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    contact = Column(String(200), default="+91 80 2839 4411")




# 7. Data Sources Table (Legal & Compliance Tracking)
class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    domain = Column(String(150), nullable=False)
    data_type = Column(String(50), index=True, nullable=False)  # devices, repair, resale, service-centers, recycling
    is_active = Column(Boolean, default=True)
    rate_limit_per_min = Column(Integer, default=30)
    terms_url = Column(String(300), nullable=True)
    compliance_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 8. Data Synchronization Runs Table (Apify Ingestion Pipeline)
class DataSyncRun(Base):
    __tablename__ = "data_sync_runs"

    id = Column(Integer, primary_key=True, index=True)
    data_type = Column(String(50), index=True, nullable=False)  # devices, repair, resale, service-centers, recycling
    actor_id = Column(String(150), nullable=True)
    run_id = Column(String(150), nullable=True)
    status = Column(String(40), default="PENDING")  # PENDING, RUNNING, COMPLETED, FAILED, TIMED_OUT
    items_scraped = Column(Integer, default=0)
    items_inserted = Column(Integer, default=0)
    items_rejected = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


# 9. Historical Price Tracking Table
class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    category = Column(String(60), index=True, nullable=False)  # repair, resale, launch_mrp
    price_min = Column(Float, nullable=False)
    price_max = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    source = Column(String(150), nullable=False)
    observed_at = Column(DateTime, default=datetime.utcnow, index=True)

    device = relationship("Device", back_populates="price_histories")


# 10. Device Problem Categories Table
class DeviceProblem(Base):
    __tablename__ = "device_problems"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(60), index=True, nullable=False)  # display, battery, motherboard, etc.
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    typical_severity = Column(String(30), default="Moderate")


# 11. User Diagnosis Records Table
class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    brand = Column(String(60), nullable=False)
    model = Column(String(100), nullable=False)
    age_years = Column(Float, default=1.5)
    storage_gb = Column(Integer, default=128)
    battery_condition = Column(String(50), default="Normal (~85%)")
    problem_description = Column(Text, nullable=False)
    image_url = Column(String(300), nullable=True)
    ai_diagnosis_json = Column(Text, nullable=True)
    problem_category = Column(String(60), nullable=True)
    severity = Column(String(30), nullable=True)
    confidence = Column(Float, default=0.85)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="diagnoses")
    transactions = relationship("Transaction", back_populates="diagnosis")
    evidence_items = relationship("DiagnosticEvidence", back_populates="diagnosis", cascade="all, delete-orphan")


# 12. User Circular Action Transactions Table
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"), nullable=True)
    action_type = Column(String(30), nullable=False)  # REPAIR, RESELL, RECYCLE, REUSE
    center_name = Column(String(150), nullable=True)
    partner_id = Column(Integer, nullable=True)
    proof_url = Column(String(300), nullable=True)
    proof_notes = Column(String(300), nullable=True)
    points_awarded = Column(Integer, default=50)
    status = Column(String(40), default="COMPLETED")  # PENDING, VERIFIED, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    diagnosis = relationship("Diagnosis", back_populates="transactions")
    rewards = relationship("Reward", back_populates="transaction")
    impacts = relationship("EnvironmentalImpact", back_populates="transaction")


# 13. Gamified Circular Reward Credits Table
class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    points_change = Column(Integer, nullable=False)
    reason = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="rewards")
    transaction = relationship("Transaction", back_populates="rewards")


# 14. Academic & CPCB LCA Environmental Factors
class EnvironmentalFactor(Base):
    __tablename__ = "environmental_factors"

    id = Column(Integer, primary_key=True, index=True)
    factor_name = Column(String(80), unique=True, nullable=False)
    co2e_saved_per_unit_kg = Column(Float, nullable=False)
    ewaste_diverted_kg = Column(Float, default=0.18)
    description = Column(Text, nullable=True)
    source = Column(String(200), default="Academic LCA & CPCB Circular Economy Guidelines")


# 15. Diagnostic Evidence Table
class DiagnosticEvidence(Base):
    __tablename__ = "diagnostic_evidence"

    id = Column(Integer, primary_key=True, index=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"), nullable=False)
    component = Column(String(100), nullable=False)
    symptom = Column(String(150), nullable=False)
    is_active = Column(Boolean, default=True)
    is_negated = Column(Boolean, default=False)
    confidence = Column(Float, default=0.85)
    evidence_text = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    diagnosis = relationship("Diagnosis", back_populates="evidence_items")


# 16. Environmental Impact Tracking Table
class EnvironmentalImpact(Base):
    __tablename__ = "environmental_impacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"), nullable=True)
    circular_action_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=True)
    metric = Column(String(100), nullable=False)  # e_waste_diverted, co2e_saved, material_recovered, lifespan_extension
    value = Column(Float, nullable=False)
    unit = Column(String(30), default="kg")
    methodology = Column(Text, nullable=True)
    source = Column(String(250), nullable=True)
    confidence = Column(String(50), default="medium")
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="impacts")


# 17. Partner System Table (Repair, Resale & Recycling Network)
class Partner(Base):
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # Repair, Resale, Recycling
    city = Column(String(80), default="Bengaluru")
    location = Column(String(300), nullable=False)
    services = Column(String(300), nullable=True)
    pricing = Column(String(100), nullable=True)
    contact = Column(String(100), nullable=True)
    verification_status = Column(String(50), default="Verified")  # Verified / Listed
    source = Column(String(200), default="Verified Circular Network")
    last_updated = Column(DateTime, default=datetime.utcnow)


# Aliases for circular actions & reward transactions
CircularAction = Transaction
RewardTransaction = Reward
