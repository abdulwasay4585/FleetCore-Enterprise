# Project 3: FleetCore Enterprise
**(Enterprise Grade Complexity - Suitable for Large Organizations)**

## 1. Project Name
**FleetCore Enterprise**

## 2. Elevator Pitch
FleetCore Enterprise is a highly scalable, real-time IoT and fleet management platform designed for global logistics, construction, and delivery conglomerates. By ingesting millions of telemetry data points per second from global assets, it provides a centralized command center for predictive maintenance, live routing, driver safety scoring, and fuel optimization, seamlessly integrating with legacy enterprise ERPs.

## 3. Business Problem
Large enterprises with thousands of physical assets (trucks, heavy machinery, refrigerated trailers) suffer from fragmented visibility. Lack of real-time monitoring leads to catastrophic equipment failures, inefficient fuel usage, stolen assets, non-compliance with strict government driving regulations (Hours of Service), and massive operational inefficiencies.

## 4. Solution
FleetCore utilizes a highly concurrent streaming architecture to capture GPS, engine diagnostics (OBD-II/J1939), and temperature sensor data globally. It processes this data in real-time to alert dispatchers of anomalies, calculate predictive maintenance schedules, ensure ELD (Electronic Logging Device) compliance, and generate massive cost-savings through fuel and route optimization algorithms.

## 5. Target Customers
* Global Freight and Logistics Companies
* Heavy Construction Firms
* Cold-Chain Food Distributors
* Public Transit Authorities
* Utility Companies

## 6. Features
### IoT & Telemetry Module
1. High-throughput TCP/UDP ingestion for IoT hardware.
2. Real-time GPS mapping (sub-second latency).
3. Engine fault code (DTC) translation.
4. Fuel level and consumption rate monitoring.
5. Cold-chain temperature tracking with strict threshold alerts.
6. Geofencing with automated entry/exit logging.
7. Dashcam video event triggers (hard braking, collisions).
8. Remote asset immobilization (anti-theft).
9. Tire pressure monitoring systems (TPMS) integration.
10. Battery health tracking for EV fleets.

### Routing & Dispatch Module
11. Dynamic route optimization considering live traffic.
12. Commercial vehicle routing (avoiding low bridges and weight restrictions).
13. Automated dispatch and load assignment.
14. Driver mobile app for manifest and proof-of-delivery (e-signature/photo).
15. ETA prediction sharing with end-customers.
16. Multi-stop route sequencing.
17. Toll cost calculation and optimization.
18. Two-way messaging between dispatcher and driver.
19. Return-trip (backhaul) load matching to reduce empty miles.
20. Yard management (tracking assets within a depot).

### Maintenance & Lifecycle Module
21. Predictive maintenance scheduling based on engine hours/mileage.
22. Digital DVIR (Driver Vehicle Inspection Reports).
23. Parts inventory management.
24. Mechanic work order management.
25. Total Cost of Ownership (TCO) calculation per asset.

### Compliance & Safety Module
26. FMCSA-compliant ELD (Hours of Service) tracking.
27. IFTA (International Fuel Tax Agreement) automated reporting.
28. Driver safety scoring (speeding, harsh cornering).
29. Automated coaching assignments based on safety scores.
30. License and medical card expiration tracking.

### Enterprise Admin & Core Platform
31. Complex hierarchical RBAC (Global HQ > Regional Hub > Local Depot).
32. Single Sign-On (OIDC/SAML).
33. Advanced reporting and BI tool integrations.
34. Open API for third-party logistics (3PL) integration.
35. ERP integration (SAP, Oracle).
36. Offline mode for mobile app (syncing data when back in cell range).
37. Custom geofence drawing tools.
38. Audit trailing.
39. Data archival and compliance retention policies.
40. Multi-language and multi-unit (Metric/Imperial) support.

## 7. AI Features
* **Predictive Maintenance:** Machine learning models analyze vibration and temperature sensor data to predict part failures weeks before they happen, scheduling repairs during planned downtime.
* **Computer Vision (Dashcams):** AI analyzes inward and outward-facing cameras in real-time to detect driver fatigue, cell phone usage, or following too closely, generating instant audio alerts in the cab.
* **Route Optimization:** AI algorithms calculate the most efficient routes considering historical traffic patterns, weather, and specific vehicle constraints.

## 8. Technical Architecture
* **Frontend:** React (Next.js) for the web dashboard; Mapbox GL JS for rendering tens of thousands of moving markers efficiently using WebGL.
* **Mobile Apps:** React Native or Flutter for cross-platform driver apps.
* **Backend:** Microservices. Java (Spring Boot) for core business logic and REST APIs; Go (Golang) or Rust for the high-concurrency UDP/TCP IoT ingestion servers.
* **Database:** 
  * PostgreSQL (Relational data).
  * TimescaleDB or Cassandra (Time-series data for telemetry).
* **Message Streaming:** Apache Kafka (Handles the firehose of incoming sensor data).
* **Stream Processing:** Apache Flink (Real-time geofence calculations and threshold alerting).
* **Caching:** Redis.
* **Cloud Infrastructure:** Multi-region AWS or GCP for global low latency.

## 9. Recommended Technology Stack
* **IoT Ingestion:** Go + Kafka (Unbeatable concurrency for handling millions of persistent TCP connections from trackers).
* **Mapping:** Mapbox (Superior performance for massive datasets compared to Google Maps).
* **Time-Series DB:** TimescaleDB (Postgres extension, allows joining relational asset data with time-series telemetry easily).
* **Microservices:** Kubernetes with Istio Service Mesh.

## 10. Database Design (PostgreSQL + TimescaleDB)
*PostgreSQL (Relational):*
1. `tenants`: Global conglomerates.
2. `regions`: Geographical divisions.
3. `depots`: Local hubs.
4. `users`: Dispatchers, Admins, Mechanics.
5. `roles`: Granular permissions.
6. `drivers`: Driver profiles.
7. `assets`: Trucks, trailers, excavators.
8. `asset_types`: Categorization.
9. `geofences`: Polygon coordinates (PostGIS).
10. `routes`: Planned paths.
11. `stops`: Waypoints on a route.
12. `work_orders`: Maintenance tickets.
13. `parts_inventory`: Spare parts.
14. `dvirs`: Inspection reports.
15. `alerts_config`: Rules for triggering notifications.
16. `safety_events`: Recorded harsh driving incidents.
17. `eld_logs`: Hours of service compliance logs.
18. `loads`: Freight being carried.
19. `api_keys`: M2M integration tokens.

*TimescaleDB (Hypertable for Time-Series):*
20. `telemetry`: Huge table (timestamp, asset_id, lat, lon, speed, heading, fuel_level, engine_temp, rpm).
21. `engine_faults`: Time-stamped DTC codes.
22. `geofence_events`: Entry/exit timestamps.
23. `driver_status_changes`: ELD duty status changes over time.
24. `temperature_logs`: Specific to refrigerated assets.
25. `fuel_purchases`: Integrated from corporate fuel cards.

## 11. API Design
* **Ingestion Protocol:** Custom binary protocol over TCP/UDP for bandwidth-constrained IoT devices.
* **REST API:**
  * `GET /api/v1/assets/locations` (Returns current state of all assets).
  * `POST /api/v1/routes/dispatch`
* **WebSockets:** `/ws/telemetry` for pushing real-time map updates to the React frontend.
* **GraphQL:** Useful for fetching nested relational data (e.g., Asset -> Driver -> Current Route -> Next Stop).

## 12. Frontend Pages
1. Live Map (Command Center).
2. Asset Directory.
3. Asset Detail (360 view of health, current location, history).
4. Driver Directory & Safety Scores.
5. Dispatch & Routing Board (Gantt chart view).
6. Maintenance Planner.
7. ELD Compliance Dashboard.
8. Reports Builder.
9. Geofence Manager.
10. Admin & Integrations.

## 13. Admin Dashboard
* Fleet utilization metrics (What % of assets are idle?).
* System health (Kafka lag, Ingestion server connections).

## 14. User Dashboard (Driver Mobile App)
* Large, high-contrast UI for use in a cab.
* ELD status toggle (Driving, On-Duty, Off-Duty, Sleeper).
* Turn-by-turn commercial navigation.
* Digital signature capture for delivery.

## 15. User Roles
* **Global Admin:** Full visibility.
* **Regional Manager:** Visibility limited to their regional depots.
* **Dispatcher:** Can assign routes and message drivers.
* **Mechanic:** Can view engine faults and update work orders.
* **Driver:** Mobile app access only.

## 16. Security
* **IoT Security:** Devices authenticate using mTLS certificates to prevent spoofing of location data.
* **Data Encryption:** Encrypted at rest.
* **VPC:** Database and Kafka clusters isolated in private subnets, accessible only via internal load balancers.

## 17. DevOps
* **Infrastructure as Code:** Terraform for provisioning AWS resources.
* **CI/CD:** Automated testing and Canary deployments (rolling out updates to 5% of ingestion servers first).
* **Observability:** Datadog for tracing requests from IoT device -> Kafka -> Flink -> Database -> WebSocket -> Browser.

## 18. Testing Strategy
* **Device Emulators:** Python scripts simulating thousands of trucks driving along real road networks to load-test the ingestion and Kafka pipeline.
* **Integration Tests:** Verifying Flink triggers geofence alerts correctly when a coordinate crosses a PostGIS boundary.

## 19. Folder Structure
```text
fleetcore/
├── ingestion-server/      # Go
├── streaming-processor/   # Flink/Java
├── core-api/              # Java/Spring Boot
├── frontend/              # Next.js
├── mobile/                # React Native
└── emulators/             # Python (for load testing)
```

## 20. UI/UX
* **Live Map:** The centerpiece. Needs clustering algorithms so 10,000 trucks don't crash the browser. Smooth interpolation of movement between GPS pings.
* **Dark Mode:** Crucial for dispatchers working night shifts.

## 21. Monetization
* Hardware sales/leasing (the GPS trackers/dashcams).
* Monthly SaaS fee per asset (e.g., $30/truck/month).

## 22. Future Roadmap
* Autonomous vehicle integration (monitoring self-driving trucks alongside human drivers).
* EV Fleet Management (routing based on charging station availability and charge times).

## 23. Portfolio Value
Proves expertise in Big Data, IoT, real-time streaming architectures, and high-performance WebGL frontends. It is a massive, complex system that solves physical-world problems.

## 24. Resume Impact
* Go/Rust for high concurrency.
* Apache Kafka & Flink (Stream Processing).
* TimescaleDB/PostGIS (Geospatial and Time-Series data).
* WebSockets and Mapbox GL.

## 25. Estimated Development Timeline
* **Month 1-2:** Core architecture, Go ingestion server, and Kafka setup.
* **Month 3-4:** TimescaleDB schema, basic REST APIs, and Mapbox integration.
* **Month 5-6:** Stream processing (Flink) for geofencing and alerting.
* **Month 7-8:** Mobile app development (React Native) and ELD compliance logic.
* **Month 9-10:** Routing algorithms, Dispatch UI, and Maintenance module.
* **Month 11-12:** Enterprise SSO, RBAC, scaling, and rigorous load testing.

## 26. GitHub Repository Structure
* Monorepo or multiple repos managed with a strict CI/CD pipeline, ensuring Protobuf/Kafka schemas are kept in sync across microservices.

## 27. README Outline
* Architecture overview. Instructions for running the device emulator to populate the local map with fake driving data.

## 28. Screens to Design
* Command Center Map.
* Gantt Chart Dispatch Board.
* ELD Log Viewer.

## 29. Figma Wireframes
* **Map Screen:** Full bleed map. Floating panels on the left for searching assets. Clicking an asset opens a right-side drawer with live video feed from the dashcam and current OBD-II stats.

## 30. Deployment Guide
* High Availability AWS architecture. Auto-scaling groups for the ingestion layer. Multi-AZ deployment for Kafka and TimescaleDB.

## 31. Stretch Features
1. Video telematics with live streaming over cellular networks.
2. Driver payroll calculation integration.
3. Automated toll transponder management.
4. Fuel card integration (preventing fraud if card is used far from the truck).
5. Satellite communication fallback for remote areas (Iridium network).
6. 3D routing for complex multi-level facilities.
7. Freight bidding marketplace integration.
8. Custom hardware firmware OTA (Over-The-Air) update manager.
9. Advanced collision reconstruction (using 100Hz accelerometer data).
10. Driver gamification and rewards program.
11. Integration with weigh station bypass systems (Drivewyze).
12. Yard mapping using drone imagery.
13. Automated cargo load planning (3D Tetris for packing trailers).
14. Emissions reporting for environmental compliance.
15. Fatigue modeling based on circadian rhythms.
16. Integration with smart trailers (door open/close sensors).
17. Passenger app for public transit use cases.
18. Dynamic speed limit fetching and comparison.
19. Voice-activated dispatcher commands.
20. Automated translation of driver-dispatcher chats.
21. Deep integrations with OEM telematics (Ford, GM, Volvo) without aftermarket hardware.
22. Advanced supply chain visibility sharing with end-customers.
23. Blockchain-based immutable proof-of-delivery logs.
24. AI-generated driver coaching videos based on specific incidents.
25. Global cellular data roaming management dashboard.
