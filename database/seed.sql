-- FleetCore Enterprise Seed Data (PostgreSQL + TimescaleDB + DTC Dictionary)

INSERT INTO tenants (id, name, subscription_tier) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Global Logistics Conglomerate Corp', 'ENTERPRISE');

-- Seed DTC Fault Code Dictionary (Diagnostic Translation)
INSERT INTO dtc_dictionary (code, system_category, description, severity, recommended_action) VALUES
('P0299', 'Turbocharger', 'Turbocharger/Supercharger Underboost Condition', 'MEDIUM', 'Inspect intake manifold pressure sensor, wastegate actuator, and intercooler hoses.'),
('P0300', 'Powertrain', 'Random/Multiple Cylinder Misfire Detected', 'CRITICAL', 'Check ignition coils, spark plugs/fuel injectors, and fuel pressure regulator immediately.'),
('P0420', 'Emissions', 'Catalyst System Efficiency Below Threshold (Bank 1)', 'LOW', 'Inspect downstream O2 sensor wiring and catalytic converter flow rate.'),
('P0117', 'Cooling System', 'Engine Coolant Temperature Sensor 1 Circuit Low Input', 'CRITICAL', 'Stop vehicle safely. Check coolant level and wiring harness to prevent engine overheating.'),
('J1939-SPN-110', 'Engine Diagnostics', 'Engine Coolant Temperature High Anomaly', 'CRITICAL', 'Engine coolant temperature exceeded 105°C safety ceiling.'),
('J1939-SPN-190', 'Engine Diagnostics', 'Engine Overspeed (RPM Redline Breach)', 'HIGH', 'Driver exceeded maximum engine RPM threshold (2300 RPM).');

INSERT INTO regions (id, tenant_id, name, code) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'North America Freight Division', 'NA-FREIGHT');

INSERT INTO depots (id, region_id, name, address) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Chicago Central Logistics Depot', '1000 Logistics Way, Chicago, IL 60601');

INSERT INTO roles (id, title, permissions) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Global Admin', '{"all": true}');

INSERT INTO users (id, tenant_id, depot_id, role_id, email, password_hash, full_name) VALUES
('u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'admin@fleetcore.com', '$2a$12$eImiTXuWVxfM37uY4JANjO5E/00.00.00.00', 'System Admin');

INSERT INTO asset_types (id, category, max_weight_kg, fuel_capacity_l, battery_kwh, tire_count) VALUES
('at0ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Heavy Duty Truck', 36000, 500, 0, 18),
('at0ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'EV Cargo Van', 4500, 0, 120, 4);

INSERT INTO assets (id, tenant_id, depot_id, asset_type_id, vin, name, make, model, year, status, is_ev, battery_capacity_kwh) VALUES
('as0ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'at0ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '19X91929410912', 'Volvo FH16 Globetrotter', 'Volvo', 'FH16', 2025, 'ACTIVE', FALSE, 0),
('as0ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'at0ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '1EG94029104910', 'BrightDrop Zevo 600', 'BrightDrop', 'Zevo 600', 2024, 'ACTIVE', TRUE, 120);

-- Insert Full Telemetry Pings with TPMS and EV Battery Data
INSERT INTO telemetry (time, asset_id, lat, lon, speed_kmh, heading, fuel_level_pct, fuel_burn_rate_lph, battery_soc_pct, battery_soh_pct, battery_temp_c, charging_state, engine_temp_c, engine_rpm, tpms_pressures_psi) VALUES
(NOW() - INTERVAL '2 minutes', 'as0ebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 41.8781, -87.6298, 105.4, 90, 84.0, 32.5, 0, 0, 0, 'IDLE', 89.0, 1450, '{"FL": 110, "FR": 109, "RL1": 108, "RL2": 110, "RR1": 107, "RR2": 111}'),
(NOW() - INTERVAL '1 minute', 'as0ebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 47.6062, -122.3321, 45.0, 270, 0, 0, 78.5, 96.2, 28.5, 'DISCHARGING', 0, 0, '{"FL": 35, "FR": 36, "RL": 35, "RR": 35}');
