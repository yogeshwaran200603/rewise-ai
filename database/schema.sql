-- =============================================================================
-- ReWise AI - PostgreSQL / Supabase Schema Definition
-- Circular Economy Platform for Damaged Electronic Devices
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) DEFAULT 'Eco Champion',
    email VARCHAR(150) UNIQUE NOT NULL,
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_models (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(60) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    release_year INTEGER DEFAULT 2023,
    category VARCHAR(50) DEFAULT 'smartphone',
    base_mfg_carbon_kg FLOAT DEFAULT 60.0,
    average_lifespan_years FLOAT DEFAULT 4.0
);

CREATE TABLE IF NOT EXISTS device_problems (
    id SERIAL PRIMARY KEY,
    category VARCHAR(60) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    typical_severity VARCHAR(30) DEFAULT 'Moderate'
);

CREATE TABLE IF NOT EXISTS repair_prices (
    id SERIAL PRIMARY KEY,
    device_model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
    problem_category VARCHAR(60) NOT NULL,
    part_cost FLOAT NOT NULL,
    labor_cost FLOAT DEFAULT 500.0,
    additional_service_cost FLOAT DEFAULT 150.0,
    total_repair_cost FLOAT NOT NULL,
    estimated_time_minutes INTEGER DEFAULT 60,
    is_indicative BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS resale_prices (
    id SERIAL PRIMARY KEY,
    device_model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
    storage_gb INTEGER DEFAULT 128,
    condition_grade VARCHAR(30) DEFAULT 'Good',
    baseline_resale_price FLOAT NOT NULL,
    low_multiplier FLOAT DEFAULT 0.85,
    high_multiplier FLOAT DEFAULT 1.15
);

CREATE TABLE IF NOT EXISTS diagnoses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    brand VARCHAR(60) NOT NULL,
    model VARCHAR(100) NOT NULL,
    age_years FLOAT DEFAULT 1.5,
    storage_gb INTEGER DEFAULT 128,
    battery_condition VARCHAR(50) DEFAULT 'Normal (~85%)',
    problem_description TEXT NOT NULL,
    image_url VARCHAR(300),
    ai_diagnosis_json TEXT,
    problem_category VARCHAR(60),
    severity VARCHAR(30),
    confidence FLOAT DEFAULT 0.85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(80) DEFAULT 'Bengaluru',
    address VARCHAR(300) NOT NULL,
    latitude FLOAT DEFAULT 12.9716,
    longitude FLOAT DEFAULT 77.5946,
    phone VARCHAR(50) DEFAULT '+91 98765 43210',
    email VARCHAR(100) DEFAULT 'support@servicecenter.in',
    rating FLOAT DEFAULT 4.6,
    services_offered VARCHAR(250),
    price_tier VARCHAR(30) DEFAULT 'Authorized / Verified',
    is_authorized BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS recycling_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(80) DEFAULT 'Bengaluru',
    address VARCHAR(300) NOT NULL,
    latitude FLOAT DEFAULT 12.9716,
    longitude FLOAT DEFAULT 77.5946,
    contact VARCHAR(100),
    accepted_device_types VARCHAR(250),
    is_cpcb_authorized BOOLEAN DEFAULT TRUE,
    collection_type VARCHAR(50) DEFAULT 'Drop-off & Doorstep Pickup'
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    diagnosis_id INTEGER REFERENCES diagnoses(id) ON DELETE SET NULL,
    action_type VARCHAR(30) NOT NULL, -- REPAIR, RESELL, RECYCLE
    center_name VARCHAR(150),
    points_awarded INTEGER DEFAULT 50,
    status VARCHAR(40) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    points_change INTEGER NOT NULL,
    reason VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS environmental_factors (
    id SERIAL PRIMARY KEY,
    factor_name VARCHAR(80) UNIQUE NOT NULL,
    co2e_saved_per_unit_kg FLOAT NOT NULL,
    ewaste_diverted_kg FLOAT DEFAULT 0.18,
    description TEXT,
    source VARCHAR(200)
);

-- Indices for rapid queries
CREATE INDEX idx_device_models_brand_model ON device_models(brand, model_name);
CREATE INDEX idx_repair_prices_model_cat ON repair_prices(device_model_id, problem_category);
CREATE INDEX idx_diagnoses_user ON diagnoses(user_id);
