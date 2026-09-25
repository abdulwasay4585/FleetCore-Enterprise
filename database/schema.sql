-- FleetCore Enterprise Database Schema (PostgreSQL + TimescaleDB + PostGIS)
-- Version: 1.1.0 - Enhanced IoT, TPMS, EV & DTC Specifications

-- Enable PostGIS & TimescaleDB extensions (Optional / skipped in standard Postgres container)
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'ENTERPRISE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Regions
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL
);

-- 3. Depots
CREATE TABLE IF NOT EXISTS depots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    location TEXT,
    address TEXT
);

-- 4. Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL
);

-- 5. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
    role_id UUID REFERENCES roles(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    sso_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cdl_number VARCHAR(50) UNIQUE NOT NULL,
    cdl_expiry DATE NOT NULL,
    medical_card_expiry DATE NOT NULL,
    safety_score INT DEFAULT 100,
    status VARCHAR(50) DEFAULT 'OFF_DUTY'
);

-- 7. Asset Types
CREATE TABLE IF NOT EXISTS asset_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- Heavy Duty, Cold-Chain, EV Van, Heavy Machinery
    max_weight_kg DOUBLE PRECISION,
    fuel_capacity_l DOUBLE PRECISION,
    battery_kwh DOUBLE PRECISION,
    tire_count INT DEFAULT 6
);

-- 8. Assets (Enhanced with EV & TPMS baseline)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    depot_id UUID REFERENCES depots(id) ON DELETE SET NULL,
    asset_type_id UUID REFERENCES asset_types(id),
    vin VARCHAR(17) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    make VARCHAR(50),
    model VARCHAR(50),
    year INT,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, MAINTENANCE, IMMOBILIZED, IDLE
    is_ev BOOLEAN DEFAULT FALSE,
    battery_capacity_kwh DOUBLE PRECISION DEFAULT 0.0,
    ideal_tpms_psi DOUBLE PRECISION DEFAULT 110.0
);

-- 9. DTC Dictionary (Diagnostic Trouble Code Translation)
CREATE TABLE IF NOT EXISTS dtc_dictionary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    system_category VARCHAR(100) NOT NULL, -- Engine, Transmission, Brakes, EV Powertrain, Reefer
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, CRITICAL, CATASTROPHIC
    recommended_action TEXT NOT NULL
);

-- 10. Geofences
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    boundary TEXT NOT NULL,
    alert_on_entry BOOLEAN DEFAULT TRUE,
    alert_on_exit BOOLEAN DEFAULT TRUE
);

-- 11. Dashcam Events
CREATE TABLE IF NOT EXISTS dashcam_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    trigger_type VARCHAR(50) NOT NULL, -- HARD_BRAKE, COLLISION, FATIGUE_DETECTED, SPEEDING
    video_url TEXT NOT NULL,
    g_force FLOAT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Routes
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id),
    driver_id UUID REFERENCES drivers(id),
    origin_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    distance_km DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'SCHEDULED'
);

-- 13. Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    mechanic_id UUID REFERENCES users(id),
    issue_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    cost DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. DVIRs
CREATE TABLE IF NOT EXISTS dvirs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    inspection_type VARCHAR(20) NOT NULL,
    passed BOOLEAN NOT NULL,
    defects_json JSONB,
    signed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. ELD Logs
CREATE TABLE IF NOT EXISTS eld_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    duty_status VARCHAR(50) NOT NULL,
    location_name VARCHAR(255),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    compliant BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- TimescaleDB Hypertables (Enhanced for Telemetry, EV, TPMS & Reefer)
-- ============================================================================

-- 16. Telemetry Hypertable (Full Feature Set)
CREATE TABLE IF NOT EXISTS telemetry (
    time TIMESTAMPTZ NOT NULL,
    asset_id UUID NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    speed_kmh FLOAT,
    heading FLOAT,
    fuel_level_pct FLOAT,
    fuel_burn_rate_lph FLOAT, -- Feature 4: Consumption Rate
    battery_soc_pct FLOAT,     -- Feature 10: EV State of Charge
    battery_soh_pct FLOAT,     -- Feature 10: EV State of Health
    battery_temp_c FLOAT,      -- Feature 10: Thermal Health
    charging_state VARCHAR(30),-- CHARGING, DISCHARGING, IDLE
    engine_temp_c FLOAT,
    engine_rpm INT,
    tpms_pressures_psi JSONB,  -- Feature 9: 18-Wheel Tire Pressures JSON
    tpms_temperatures_c JSONB  -- Feature 9: Tire Temps JSON
);
-- SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE);

-- 17. Engine Faults Hypertable
CREATE TABLE IF NOT EXISTS engine_faults (
    time TIMESTAMPTZ NOT NULL,
    asset_id UUID NOT NULL,
    dtc_code VARCHAR(30) NOT NULL,
    description TEXT,
    severity VARCHAR(20)
);
-- SELECT create_hypertable('engine_faults', 'time', if_not_exists => TRUE);

-- 18. Geofence Events Hypertable (Feature 6: Entry/Exit)
CREATE TABLE IF NOT EXISTS geofence_events (
    time TIMESTAMPTZ NOT NULL,
    asset_id UUID NOT NULL,
    geofence_id UUID NOT NULL,
    event_type VARCHAR(20) NOT NULL -- ENTRY, EXIT
);
-- SELECT create_hypertable('geofence_events', 'time', if_not_exists => TRUE);

-- 19. Temperature Logs Hypertable (Feature 5: Cold-Chain Reefer)
CREATE TABLE IF NOT EXISTS temperature_logs (
    time TIMESTAMPTZ NOT NULL,
    asset_id UUID NOT NULL,
    zone_1_temp FLOAT NOT NULL,
    zone_2_temp FLOAT,
    target_temp FLOAT NOT NULL,
    breach_flag BOOLEAN DEFAULT FALSE,
    compressor_status VARCHAR(20)
);
-- SELECT create_hypertable('temperature_logs', 'time', if_not_exists => TRUE);

-- 20. Remote Commands Log (Feature 8: Immobilization)
CREATE TABLE IF NOT EXISTS remote_commands (
    time TIMESTAMPTZ NOT NULL,
    asset_id UUID NOT NULL,
    command_type VARCHAR(50) NOT NULL, -- IMMOBILIZE, UNLOCK, RESTART_ECM
    issued_by UUID REFERENCES users(id),
    execution_status VARCHAR(30) NOT NULL
);
-- SELECT create_hypertable('remote_commands', 'time', if_not_exists => TRUE);

-- 21. Parts Inventory (Feature 23: Parts & Shop Inventory)
CREATE TABLE IF NOT EXISTS parts_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL, -- BRAKES, FILTERS, ELECTRICAL, ENGINE, TIRES
    stock_quantity INT DEFAULT 0,
    min_reorder_threshold INT DEFAULT 5,
    unit_cost DOUBLE PRECISION DEFAULT 0.0,
    supplier_edi_code VARCHAR(50) DEFAULT 'EDI-850-AUTO'
);

-- 22. Dispatcher-Driver Messaging (Feature 18: Two-way Urgent Chat)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id VARCHAR(100) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    message_body TEXT NOT NULL,
    priority VARCHAR(30) DEFAULT 'NORMAL', -- NORMAL, URGENT, EMERGENCY_SOS
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- 23. Driver Manifest & E-Signatures (Feature 14: Mobile Proof of Delivery)
CREATE TABLE IF NOT EXISTS manifest_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    customer_name VARCHAR(150) NOT NULL,
    signature_blob_data TEXT NOT NULL, -- Base64 PNG or S3 Glacier Object URL
    signed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    sha256_verification_hash VARCHAR(64) NOT NULL
);

-- 24. IFTA Mileage Tax Rollups (Feature 27: Automated Fuel Tax)
CREATE TABLE IF NOT EXISTS ifta_mileage_rollups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    jurisdiction_state VARCHAR(10) NOT NULL, -- e.g., CA, TX, IL, IL-TPK
    fiscal_quarter VARCHAR(10) NOT NULL, -- e.g., 2026-Q3
    taxable_miles DOUBLE PRECISION DEFAULT 0.0,
    fuel_gallons_purchased DOUBLE PRECISION DEFAULT 0.0,
    net_tax_due_usd DOUBLE PRECISION DEFAULT 0.0
);

-- ============================================================================
-- Section 31: Phase 6 Advanced Stretch Features (S1 to S25)
-- ============================================================================

-- 25. Driver Payroll & Settlement (S2)
CREATE TABLE IF NOT EXISTS stretch_payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    pay_period VARCHAR(30) NOT NULL,
    base_mileage_pay DOUBLE PRECISION DEFAULT 0.0,
    detention_pay_usd DOUBLE PRECISION DEFAULT 0.0,
    per_diem_usd DOUBLE PRECISION DEFAULT 0.0,
    total_settlement_usd DOUBLE PRECISION DEFAULT 0.0,
    payroll_status VARCHAR(50) DEFAULT 'PROCESSED_ADP_EDI',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 26. Toll Transponder Reconciliation & Disputes (S3)
CREATE TABLE IF NOT EXISTS stretch_toll_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    toll_plaza_name VARCHAR(150) NOT NULL,
    transponder_tag_id VARCHAR(100) NOT NULL, -- E-ZPass / PrePass / Bestpass
    billed_amount_usd DOUBLE PRECISION NOT NULL,
    geofence_cross_checked BOOLEAN DEFAULT TRUE,
    is_disputed_phantom_charge BOOLEAN DEFAULT FALSE,
    dispute_reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 27. Hardware Firmware Over-the-Air (OTA) Jobs (S8)
CREATE TABLE IF NOT EXISTS stretch_firmware_ota_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_hw_id VARCHAR(100) NOT NULL,
    target_firmware_version VARCHAR(50) NOT NULL, -- e.g., v3.14-PROD-CAN
    sha256_binary_checksum VARCHAR(64) NOT NULL,
    dual_bank_rollback_enabled BOOLEAN DEFAULT TRUE,
    ota_status VARCHAR(50) DEFAULT 'IN_PROGRESS_CHRG_STATION', -- SCHEDULED, IN_PROGRESS, SUCCESS, ROLLED_BACK
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 28. Driver Gamification & Rewards Program (S10)
CREATE TABLE IF NOT EXISTS stretch_driver_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    xp_points_balance INTEGER DEFAULT 1540,
    current_tier VARCHAR(50) DEFAULT 'PLATINUM_DRIVER',
    badges_earned JSONB DEFAULT '["MILLION_MILER_SAFE", "ZERO_HARSH_BRAKE_MONTH", "ECO_DRIVING_CHAMPION"]'::jsonb,
    gift_card_rewards_claimed_usd DOUBLE PRECISION DEFAULT 250.0,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 29. Drone Imagery Yard Mapping & OCR Inspection (S12)
CREATE TABLE IF NOT EXISTS stretch_yard_drone_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    depot_yard_name VARCHAR(150) NOT NULL,
    drone_flight_id VARCHAR(100) NOT NULL,
    detected_container_number VARCHAR(50) NOT NULL, -- e.g., MSCU-748291-0
    parking_bay_coordinate VARCHAR(50) NOT NULL, -- e.g., BAY-B-14
    ocr_confidence_pct FLOAT DEFAULT 99.4,
    thermal_roof_anomaly_detected BOOLEAN DEFAULT FALSE,
    scan_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 30. 3D Tetris Cargo Load & Weight Axle Optimization (S13)
CREATE TABLE IF NOT EXISTS stretch_cargo_load_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    trailer_type VARCHAR(50) DEFAULT '53FT_REFRIGERATED_VAN',
    volume_utilization_pct FLOAT DEFAULT 92.4,
    front_steer_axle_lbs INTEGER DEFAULT 11800, -- Max 12,000 lbs
    drive_tandem_lbs INTEGER DEFAULT 33400,    -- Max 34,000 lbs
    trailer_tandem_lbs INTEGER DEFAULT 33750,  -- Max 34,000 lbs
    bridge_law_compliant BOOLEAN DEFAULT TRUE,
    stacking_manifest_json JSONB
);

-- 31. Blockchain Proof-of-Delivery & Smart Contract Escrow (S23)
CREATE TABLE IF NOT EXISTS stretch_blockchain_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_signature_id UUID REFERENCES manifest_signatures(id),
    blockchain_network VARCHAR(50) DEFAULT 'ETHEREUM_L2_BASE',
    smart_contract_address VARCHAR(100) DEFAULT '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    merkle_root_hash VARCHAR(100) NOT NULL,
    escrow_amount_usdt DOUBLE PRECISION DEFAULT 4250.00,
    escrow_status VARCHAR(50) DEFAULT 'RELEASED_UPON_GEOFENCE_GPS',
    transaction_tx_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 32. Direct OEM Cloud Telematics Federation (S21)
CREATE TABLE IF NOT EXISTS stretch_oem_telematics_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oem_partner_name VARCHAR(100) NOT NULL, -- FORD_COMMERCIAL, VOLVO_CONNECT, GM_ONSTAR, FREIGHTLINER_DETROIT
    api_endpoint_url VARCHAR(255) NOT NULL,
    oauth_client_id VARCHAR(100) NOT NULL,
    federated_assets_count INTEGER DEFAULT 0,
    sync_frequency_seconds INTEGER DEFAULT 30,
    last_sync_status VARCHAR(50) DEFAULT 'ACTIVE_200_OK',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- v1.2.0 — SRS-Required Missing Tables Added
-- ============================================================================

-- 33. Stops (Route Waypoints — Feature F16 multi-stop sequencing)
CREATE TABLE IF NOT EXISTS stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    estimated_arrival TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    dwell_minutes INT DEFAULT 0,
    stop_type VARCHAR(50) DEFAULT 'DELIVERY',        -- DELIVERY, PICKUP, FUEL, REST, CUSTOMS
    status VARCHAR(50) DEFAULT 'PENDING',            -- PENDING, ARRIVED, DEPARTED, SKIPPED
    customer_name VARCHAR(150),
    proof_of_delivery_signed BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- 34. Loads (Freight Cargo — Feature F13 automated load assignment)
CREATE TABLE IF NOT EXISTS loads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    load_reference VARCHAR(100) UNIQUE NOT NULL,
    bol_number VARCHAR(100) UNIQUE,
    commodity_type VARCHAR(100) NOT NULL,
    weight_lbs DOUBLE PRECISION,
    pallets INT DEFAULT 0,
    volume_cuft DOUBLE PRECISION,
    hazmat BOOLEAN DEFAULT FALSE,
    hazmat_class VARCHAR(20),
    shipper_name VARCHAR(150),
    consignee_name VARCHAR(150),
    pickup_location TEXT,
    delivery_location TEXT,
    pickup_date DATE,
    delivery_date DATE,
    freight_rate_usd DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'AVAILABLE',          -- AVAILABLE, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 35. API Keys (Feature F34 — Open API for 3PL integration)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    key_name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(256) NOT NULL UNIQUE,           -- SHA-256 hash; never store plaintext
    key_prefix VARCHAR(12) NOT NULL,                 -- First 12 chars shown to user: "fc_live_xK9m"
    scopes TEXT[],                                   -- ['assets:read','routes:write','telemetry:read']
    rate_limit_rpm INT DEFAULT 1000,
    ip_whitelist TEXT[],
    environment VARCHAR(20) DEFAULT 'PRODUCTION',    -- PRODUCTION, SANDBOX
    status VARCHAR(30) DEFAULT 'ACTIVE',             -- ACTIVE, REVOKED, EXPIRED
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 36. Safety Events (Feature F28 — driver safety scoring incidents)
CREATE TABLE IF NOT EXISTS safety_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    event_type VARCHAR(50) NOT NULL,                 -- HARD_BRAKE, HARSH_CORNERING, RAPID_ACCELERATION, SPEEDING, TAILGATING, PHONE_USAGE, FATIGUE
    severity VARCHAR(20) NOT NULL,                   -- LOW, MEDIUM, HIGH, CRITICAL
    speed_at_event_kmh FLOAT,
    g_force FLOAT,
    location_lat DOUBLE PRECISION,
    location_lon DOUBLE PRECISION,
    location_name VARCHAR(255),
    dashcam_clip_url TEXT,
    points_deducted INT DEFAULT 5,
    coaching_dispatched BOOLEAN DEFAULT FALSE,
    coaching_module_assigned VARCHAR(100),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    event_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 37. Alerts Configuration (Feature F5 cold-chain, geofence, speed threshold alerts)
CREATE TABLE IF NOT EXISTS alerts_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    alert_name VARCHAR(150) NOT NULL,
    alert_type VARCHAR(80) NOT NULL,                 -- GEOFENCE_EXIT, SPEED_THRESHOLD, TEMP_BREACH, FUEL_LOW, DTC_CRITICAL, HOS_VIOLATION, BATTERY_CRITICAL
    target_scope VARCHAR(50) DEFAULT 'ALL_ASSETS',   -- ALL_ASSETS, ASSET_TYPE, SPECIFIC_ASSET, DRIVER
    target_id UUID,
    condition_operator VARCHAR(20) DEFAULT 'GREATER_THAN',
    threshold_value DOUBLE PRECISION,
    threshold_unit VARCHAR(30),                      -- KMH, PSI, CELSIUS, PCT, HOURS
    notification_channels TEXT[] DEFAULT '{EMAIL,DASHBOARD,SMS}',
    recipients_json JSONB,
    cooldown_minutes INT DEFAULT 15,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    trigger_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 38. Audit Log (Feature F38 — immutable audit trail for all critical platform events)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    actor_name VARCHAR(150),
    actor_role VARCHAR(80),
    action_type VARCHAR(100) NOT NULL,               -- USER_LOGIN, ASSET_IMMOBILIZED, ROUTE_DISPATCHED, DVIR_SIGNED, API_KEY_CREATED, ROLE_CHANGED, DATA_EXPORTED
    entity_type VARCHAR(80),                         -- ASSET, DRIVER, ROUTE, USER, API_KEY, GEOFENCE
    entity_id UUID,
    entity_name VARCHAR(255),
    changes_json JSONB,                              -- { "before": {...}, "after": {...} }
    ip_address INET,
    user_agent TEXT,
    result VARCHAR(30) DEFAULT 'SUCCESS',            -- SUCCESS, FAILURE, BLOCKED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 39. Fuel Purchases (Feature F4 — fuel card integration and IFTA reporting)
CREATE TABLE IF NOT EXISTS fuel_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id),
    fuel_card_number VARCHAR(50),
    fuel_card_vendor VARCHAR(50) DEFAULT 'WEX',      -- WEX, COMDATA, FLEETONE, PILOT_FLYING_J
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    station_name VARCHAR(200),
    station_address TEXT,
    fuel_type VARCHAR(30) DEFAULT 'DIESEL',          -- DIESEL, REGULAR, DEF, CNG, LNG
    volume_gallons DOUBLE PRECISION NOT NULL,
    price_per_gallon DOUBLE PRECISION,
    total_amount_usd DOUBLE PRECISION NOT NULL,
    odometer_miles DOUBLE PRECISION,
    gps_lat_at_purchase DOUBLE PRECISION,
    gps_lon_at_purchase DOUBLE PRECISION,
    gps_discrepancy_km DOUBLE PRECISION DEFAULT 0.0,
    fraud_flag BOOLEAN DEFAULT FALSE,
    dispute_status VARCHAR(50) DEFAULT 'VERIFIED',   -- VERIFIED, UNDER_REVIEW, DISPUTED, FRAUDULENT
    ifta_jurisdiction VARCHAR(10),
    purchased_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 40. Driver Status Changes (TimescaleDB hypertable — ELD duty cycle tracking)
CREATE TABLE IF NOT EXISTS driver_status_changes (
    time TIMESTAMPTZ NOT NULL,
    driver_id UUID NOT NULL,
    previous_status VARCHAR(50),                     -- OFF_DUTY, SLEEPER_BERTH, DRIVING, ON_DUTY_NOT_DRIVING
    new_status VARCHAR(50) NOT NULL,
    location_name VARCHAR(255),
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    odometer_miles DOUBLE PRECISION,
    eld_device_id VARCHAR(100),
    auto_detected BOOLEAN DEFAULT FALSE,
    remarks TEXT
);
-- SELECT create_hypertable('driver_status_changes', 'time', if_not_exists => TRUE);

-- 41. User Sessions (SSO/OIDC session persistence — Feature F32)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_token VARCHAR(256) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    sso_provider VARCHAR(50) DEFAULT 'LOCAL',        -- OIDC, SAML, LOCAL
    sso_id_token TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_stops_route ON stops(route_id);
CREATE INDEX IF NOT EXISTS idx_stops_status ON stops(status);
CREATE INDEX IF NOT EXISTS idx_loads_tenant ON loads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_bol ON loads(bol_number);
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_safety_events_driver ON safety_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_safety_events_asset ON safety_events(asset_id);
CREATE INDEX IF NOT EXISTS idx_safety_events_time ON safety_events(event_time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_tenant ON alerts_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts_config(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts_config(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_time ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_asset ON fuel_purchases(asset_id);
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_fraud ON fuel_purchases(fraud_flag) WHERE fraud_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_fuel_purchases_time ON fuel_purchases(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_status_driver ON driver_status_changes(driver_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
