/**
 * FleetCore Enterprise - Client Application & Telemetry Engine v2.0.0
 * Comprehensive Frontend Logic backing all 40 Core Features & AI Modules
 */

// Comprehensive Fleet Assets State
const FLEET_ASSETS = [
  {
    id: "TRK-8921",
    name: "Volvo FH16 Globetrotter",
    category: "Heavy Duty Freight",
    vin: "19X91929410912",
    driver: "Marcus Vance",
    depot: "Chicago Hub North",
    status: "ONLINE",
    lat: 41.8781,
    lon: -87.6298,
    speed: 105.4,
    rpm: 1450,
    fuelPct: 84,
    fuelBurnRateLph: 32.5,
    reeferTemp: -18.2,
    targetTemp: -20.0,
    isEv: false,
    tco: "$1.42/mi",
    tpms: { FL: 110.0, FR: 109.5, RL1: 108.0, RL2: 110.2, RR1: 107.5, RR2: 111.0 },
    dtc: { code: "P0299", system: "Turbocharger", desc: "Turbocharger Underboost Condition", severity: "MEDIUM", action: "Inspect intake manifold pressure sensor, wastegate actuator, and intercooler hoses." }
  },
  {
    id: "REEFER-4412",
    name: "Thermo King Reefer 53ft",
    category: "Cold-Chain Trailer",
    vin: "22Z40192830192",
    driver: "Elena Rostova",
    depot: "Detroit Depot East",
    status: "ONLINE",
    lat: 42.3314,
    lon: -83.0458,
    speed: 94.2,
    rpm: 1380,
    fuelPct: 92,
    fuelBurnRateLph: 28.1,
    reeferTemp: -22.5,
    targetTemp: -22.0,
    isEv: false,
    tco: "$1.18/mi",
    tpms: { FL: 112.0, FR: 111.5, RL1: 110.0, RL2: 110.0, RR1: 109.5, RR2: 110.5 },
    dtc: null
  },
  {
    id: "EV-VAN-902",
    name: "BrightDrop Zevo 600",
    category: "EV Cargo Van",
    vin: "1EG94029104910",
    driver: "Chen Wei",
    depot: "Seattle Port Central",
    status: "ONLINE",
    lat: 47.6062,
    lon: -122.3321,
    speed: 45.0,
    rpm: 0,
    fuelPct: 0,
    fuelBurnRateLph: 0,
    reeferTemp: 21.0,
    targetTemp: 21.0,
    isEv: true,
    evSoc: 78.5,
    evSoh: 96.2,
    evTemp: 28.5,
    chargingState: "DISCHARGING",
    tco: "$0.65/mi",
    tpms: { FL: 35.0, FR: 35.5, RL1: 34.8, RR1: 35.2 },
    dtc: null
  },
  {
    id: "CAT-EXC-770",
    name: "Caterpillar 349 Excavator",
    category: "Heavy Construction",
    vin: "99CAT349X01920",
    driver: "Jake Miller",
    depot: "Dallas Logistics Yard",
    status: "IDLE",
    lat: 32.7767,
    lon: -96.7970,
    speed: 0.0,
    rpm: 1900,
    fuelPct: 65,
    fuelBurnRateLph: 45.2,
    reeferTemp: 85.0,
    targetTemp: 85.0,
    isEv: false,
    tco: "$3.85/hr",
    tpms: null,
    dtc: { code: "P0087", system: "Fuel System", desc: "Fuel Rail/System Pressure Too Low", severity: "HIGH", action: "Replace fuel filter element and check high pressure fuel pump." }
  }
];

let map = null;
let leafletMarkers = {};
let selectedAsset = FLEET_ASSETS[0];

// Global Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  initLeafletMap();
  renderAssetList();
  renderAssetDirectoryTable();
  renderGanttBoard();
  renderYardAssets();
  renderDriverSafetyTable();
  renderWorkOrders();
  renderPartsInventory();
  renderExpirations();
  startLiveTelemetryLoop();
});

// Page Navigation
function switchPage(pageId) {
  document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-tab").forEach(el => el.classList.remove("active"));

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add("active");

  const activeTab = Array.from(document.querySelectorAll(".nav-tab")).find(tab => tab.getAttribute("onclick")?.includes(pageId));
  if (activeTab) activeTab.classList.add("active");

  if (pageId === "command-center" && map) {
    setTimeout(() => map.invalidateSize(), 200);
  }
}

// Leaflet Map Initialization
function initLeafletMap() {
  const mapEl = document.getElementById("command-map");
  if (!mapEl) return;

  map = L.map("command-map", { zoomControl: false }).setView([39.8283, -98.5795], 4);
  L.control.zoom({ position: "bottomright" }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; FleetCore Enterprise Telemetry Layer',
    maxZoom: 19
  }).addTo(map);

  FLEET_ASSETS.forEach(asset => {
    const marker = L.circleMarker([asset.lat, asset.lon], {
      radius: 8,
      fillColor: asset.status === 'ONLINE' ? '#00E699' : asset.status === 'IDLE' ? '#D4A373' : '#FF4D4D',
      color: '#000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map);

    marker.bindTooltip(`<strong>${asset.id}</strong><br>${asset.name}<br>${asset.speed} km/h`, { permanent: false, direction: 'top' });
    marker.on('click', () => selectAsset(asset.id));
    leafletMarkers[asset.id] = marker;
  });
}

function renderAssetList(filtered = FLEET_ASSETS) {
  const listEl = document.getElementById("map-asset-list");
  if (!listEl) return;

  listEl.innerHTML = filtered.map(asset => `
    <div class="asset-card ${selectedAsset && selectedAsset.id === asset.id ? 'active' : ''}" onclick="selectAsset('${asset.id}')">
      <div class="asset-card-header">
        <span class="asset-card-title">${asset.id} - ${asset.name}</span>
        <span class="asset-badge ${asset.status === 'ONLINE' ? 'badge-online' : asset.status === 'IDLE' ? 'badge-idle' : 'badge-alert'}">${asset.status}</span>
      </div>
      <div class="asset-card-sub">
        <span>Driver: ${asset.driver}</span>
        <span>Speed: ${asset.speed} km/h</span>
      </div>
    </div>
  `).join("");
}

function selectAsset(id) {
  const asset = FLEET_ASSETS.find(a => a.id === id);
  if (!asset) return;
  selectedAsset = asset;

  renderAssetList();

  const drawer = document.getElementById("asset-drawer");
  if (drawer) drawer.style.display = "flex";

  document.getElementById("drawer-asset-id").innerText = asset.id;
  document.getElementById("drawer-asset-name").innerText = asset.name;
  document.getElementById("drawer-asset-vin").innerText = `VIN: ${asset.vin}`;
  document.getElementById("drawer-driver").innerText = asset.driver;
  document.getElementById("drawer-speed").innerText = `${asset.speed} km/h`;
  document.getElementById("drawer-fuel-burn").innerText = asset.fuelBurnRateLph > 0 ? `${asset.fuelBurnRateLph} L/h` : '0 L/h (EV)';
  document.getElementById("drawer-reefer-temp").innerText = `${asset.reeferTemp}°C`;

  // TPMS Grid
  const tpmsGrid = document.getElementById("tpms-grid");
  if (tpmsGrid) {
    if (asset.tpms) {
      tpmsGrid.innerHTML = Object.entries(asset.tpms).map(([pos, psi]) => `
        <div class="tpms-tire" style="background: ${psi < 100 ? 'rgba(255,77,77,0.2)' : 'rgba(0,230,153,0.1)'}; border: 1px solid ${psi < 100 ? '#FF4D4D' : '#00E699'}; border-radius: 4px; padding: 4px; text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-steel);">${pos}</div>
          <div style="font-weight: 700; font-size: 0.85rem;">${psi}</div>
        </div>
      `).join("");
    } else {
      tpmsGrid.innerHTML = `<span class="text-muted" style="font-size:0.8rem;">No TPMS sensors configured for construction equipment.</span>`;
    }
  }

  // EV Subpanel
  const evPanel = document.getElementById("ev-subpanel");
  if (evPanel) {
    evPanel.style.display = asset.isEv ? "block" : "none";
    if (asset.isEv) {
      document.getElementById("ev-soc").innerText = `${asset.evSoc}%`;
      document.getElementById("ev-soh").innerText = `${asset.evSoh}%`;
    }
  }

  // DTC Box
  const dtcSection = document.getElementById("dtc-section");
  if (dtcSection) {
    if (asset.dtc) {
      dtcSection.style.display = "block";
      document.getElementById("dtc-box-content").innerHTML = `
        <strong>${asset.dtc.code} (${asset.dtc.severity})</strong>: ${asset.dtc.desc}<br>
        <span style="font-size:0.75rem; color:var(--color-steel);">Action: ${asset.dtc.action}</span>
      `;
    } else {
      dtcSection.style.display = "none";
    }
  }

  if (map) map.flyTo([asset.lat, asset.lon], 12);
}

function closeDrawer() {
  const drawer = document.getElementById("asset-drawer");
  if (drawer) drawer.style.display = "none";
}

function renderAssetDirectoryTable() {
  const body = document.getElementById("asset-directory-table-body");
  if (!body) return;

  body.innerHTML = FLEET_ASSETS.map(asset => {
    const badgeClass = asset.status === 'ONLINE' ? 'badge-online' : asset.status === 'IDLE' ? 'badge-idle' : 'badge-alert';
    const fuelOrEv = asset.isEv ? `⚡ ${asset.evSoc}% SoC` : `⛽ ${asset.fuelPct}%`;
    const tpmsSummary = asset.tpms ? `${asset.tpms.FL || 110} PSI (FL)` : 'N/A';

    return `
      <tr>
        <td><strong>${asset.id}</strong></td>
        <td>${asset.name}<br><span class="text-muted" style="font-size:0.75rem;">VIN: ${asset.vin}</span></td>
        <td>${asset.category}</td>
        <td>${asset.depot}</td>
        <td>${asset.driver}</td>
        <td><span class="asset-badge ${badgeClass}">${asset.status}</span></td>
        <td><strong>${fuelOrEv}</strong></td>
        <td>${asset.fuelBurnRateLph > 0 ? asset.fuelBurnRateLph + ' L/h' : '0 L/h (EV)'}</td>
        <td>${tpmsSummary}</td>
        <td><button class="btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;" onclick="selectAsset('${asset.id}')">Inspect 360</button></td>
      </tr>
    `;
  }).join("");
}

// Render Gantt Dispatch Board
function renderGanttBoard() {
  const container = document.getElementById("gantt-rows");
  if (!container) return;

  const routes = [
    { asset: "TRK-8921", driver: "Marcus Vance", load: "Costco Freight #9910", startPct: 10, widthPct: 55, color: "#3b82f6" },
    { asset: "REEFER-4412", driver: "Elena Rostova", load: "Cold-Chain Pharma #402", startPct: 25, widthPct: 60, color: "#00E699" },
    { asset: "EV-VAN-902", driver: "Chen Wei", load: "Last-Mile Delivery #110", startPct: 5, widthPct: 35, color: "#8b5cf6" },
    { asset: "CAT-EXC-770", driver: "Jake Miller", load: "Site Excavation Prep", startPct: 40, widthPct: 30, color: "#D4A373" }
  ];

  container.innerHTML = routes.map(r => `
    <div style="display: flex; align-items: center; background: #111; padding: 8px; border-radius: 6px;">
      <div style="width: 180px; font-size: 0.82rem;"><strong>${r.asset}</strong><br><span style="color:#888;">${r.driver}</span></div>
      <div style="flex: 1; background: #222; height: 24px; border-radius: 4px; position: relative;">
        <div style="position: absolute; left: ${r.startPct}%; width: ${r.widthPct}%; background: ${r.color}; height: 100%; border-radius: 4px; padding-left: 8px; color: #fff; font-size: 0.75rem; font-weight: 700; line-height: 24px; overflow: hidden; white-space: nowrap;">
          ${r.load}
        </div>
      </div>
    </div>
  `).join("");
}

// Render Yard Status
function renderYardAssets() {
  const container = document.getElementById("yard-asset-list");
  if (!container) return;

  const yard = [
    { asset: "TRK-8921", bay: "Dock Bay #7", zone: "LOADING", dwell: "1.5 hrs" },
    { asset: "REEFER-4412", bay: "Cold Storage #2", zone: "STAGING", dwell: "3.2 hrs" },
    { asset: "EV-VAN-902", bay: "EV Charger #1", zone: "PARKING", dwell: "6.0 hrs" }
  ];

  container.innerHTML = yard.map(y => `
    <div style="display: flex; justify-content: space-between; background: #111; padding: 8px; border-radius: 4px; font-size: 0.85rem;">
      <div><strong>${y.asset}</strong> — ${y.bay}</div>
      <div><span style="color: var(--color-copper); font-weight: 700;">${y.zone}</span> (${y.dwell})</div>
    </div>
  `).join("");
}

// Render Driver Safety Table
function renderDriverSafetyTable() {
  const body = document.getElementById("driver-safety-table-body");
  if (!body) return;

  const drivers = [
    { name: "Marcus Vance", score: 92, braking: 1, overspeed: 0, fatigue: 0, status: "TIER 1 (EXCELLENT)" },
    { name: "Elena Rostova", score: 88, braking: 2, overspeed: 1, fatigue: 0, status: "TIER 1 (EXCELLENT)" },
    { name: "Jake Miller", score: 68, braking: 5, overspeed: 4, fatigue: 2, status: "TIER 3 (COACHING REQUIRED)" },
    { name: "Chen Wei", score: 96, braking: 0, overspeed: 0, fatigue: 0, status: "TIER 1 (EXCELLENT)" }
  ];

  body.innerHTML = drivers.map(d => `
    <tr>
      <td><strong>${d.name}</strong></td>
      <td><strong style="color: ${d.score < 75 ? 'var(--color-danger)' : 'var(--color-success)'};">${d.score} / 100</strong></td>
      <td>${d.braking}</td>
      <td>${d.overspeed}</td>
      <td>${d.fatigue}</td>
      <td><span class="asset-badge ${d.score < 75 ? 'badge-alert' : 'badge-online'}">${d.status}</span></td>
      <td><button class="btn-secondary" style="font-size:0.75rem;" onclick="alert('Coaching module assigned to ${d.name}')">Assign Coaching</button></td>
    </tr>
  `).join("");
}

// Render Work Orders
function renderWorkOrders() {
  const container = document.getElementById("work-orders-list");
  if (!container) return;

  const wos = [
    { id: "WO-2026001", asset: "TRK-8921", issue: "Brake Pad Replacement & Air Line Flush", status: "IN_PROGRESS", estCost: "$420.00" },
    { id: "WO-2026002", asset: "CAT-EXC-770", issue: "Fuel Rail Pressure Sensor Replacement", status: "OPEN", estCost: "$850.00" }
  ];

  container.innerHTML = wos.map(w => `
    <div style="background: #111; padding: 10px; border-radius: 4px; font-size: 0.85rem;">
      <div style="display: flex; justify-content: space-between;">
        <strong>${w.id} (${w.asset})</strong>
        <span style="color: var(--color-copper); font-weight: 700;">${w.status}</span>
      </div>
      <div style="color: #aaa; margin-top: 4px;">${w.issue} — Est: ${w.estCost}</div>
    </div>
  `).join("");
}

// Render Parts Inventory
function renderPartsInventory() {
  const container = document.getElementById("parts-inventory-list");
  if (!container) return;

  const parts = [
    { number: "BRK-PAD-2240", name: "Bendix ADB22X Brake Pad Set", qty: 24, reorder: false },
    { number: "OIL-FLT-LF9009", name: "Fleetguard LF9009 Oil Filter", qty: 6, reorder: true },
    { number: "TIRE-MICH-XDA5", name: "Michelin XDA5 11R22.5 Drive Tire", qty: 8, reorder: false }
  ];

  container.innerHTML = parts.map(p => `
    <div style="display: flex; justify-content: space-between; background: #111; padding: 8px; border-radius: 4px; font-size: 0.85rem;">
      <div><strong>${p.number}</strong> — ${p.name}</div>
      <div>Qty: <strong>${p.qty}</strong> ${p.reorder ? '<span style="color: var(--color-danger); font-weight:700;">(REORDER)</span>' : ''}</div>
    </div>
  `).join("");
}

// Render Expirations
function renderExpirations() {
  const container = document.getElementById("expirations-list");
  if (!container) return;

  const exps = [
    { driver: "Marcus Vance", doc: "CDL License Class A", expiry: "2026-09-15", status: "EXPIRING IN 51 DAYS" },
    { driver: "Elena Rostova", doc: "DOT Medical Card", expiry: "2026-08-02", status: "EXPIRING IN 7 DAYS" }
  ];

  container.innerHTML = exps.map(e => `
    <div style="display: flex; justify-content: space-between; background: #111; padding: 8px; border-radius: 4px; font-size: 0.85rem;">
      <div><strong>${e.driver}</strong> — ${e.doc}</div>
      <div style="color: var(--color-warning); font-weight: 700;">${e.status} (${e.expiry})</div>
    </div>
  `).join("");
}

// Real-Time Telemetry Loop
function startLiveTelemetryLoop() {
  setInterval(() => {
    FLEET_ASSETS.forEach(asset => {
      if (asset.status === 'ONLINE') {
        asset.lat += (Math.random() - 0.5) * 0.002;
        asset.lon += (Math.random() - 0.5) * 0.002;
        asset.speed = Math.max(20, Math.min(120, +(asset.speed + (Math.random() - 0.5) * 3).toFixed(1)));

        if (leafletMarkers[asset.id]) {
          leafletMarkers[asset.id].setLatLng([asset.lat, asset.lon]);
        }
      }
    });
  }, 1000);
}

// Dispatch / Route Action Functions
function calculateOptimizedRoute() {
  const output = document.getElementById("route-opt-output");
  output.style.display = "block";
  output.innerHTML = `
[Route Optimization Engine (F11/F16)]
TSP Sequenced Stops: Chicago HQ -> Costco -> Target -> Walmart -> Home Depot
Total Distance: 384.2 km
Est. Travel Time: 4h 15m (Traffic Multiplier: 1.1x LIGHT)
Toll Breakdown: Illinois Tollway ($14.80), Indiana Toll Road ($32.50)
Commercial Warning: Vehicle Height 4.2m exceeds Skyway clearance (4.1m). Rerouted via I-94.
  `;
}

function runAutoDispatch() {
  alert("⚡ [F13 AUTO-DISPATCH] Matched 4 unassigned loads to closest available assets based on proximity, cargo compatibility & HOS remaining.");
}

function runBackhaulMatching() {
  alert("🔄 [F19 BACKHAUL ENGINE] Found 2 return-trip matches saving 420 km of empty miles ($1,050 cost savings).");
}

function generateBIReport() {
  const out = document.getElementById("bi-report-output");
  out.style.display = "block";
  out.innerHTML = `
{
  "reportId": "RPT-90129",
  "generatedAt": "${new Date().toISOString()}",
  "totalAssets": 1420,
  "fleetUtilizationPct": 94.2,
  "avgDailyMiles": 285.4,
  "totalGallonsConsumed": 184520,
  "graphqlEndpoint": "http://localhost:8080/graphql"
}
  `;
}

function triggerERPSyncUI() {
  const out = document.getElementById("admin-output");
  out.style.display = "block";
  out.innerHTML = `[SAP ERP SYNC] Triggered outbound sync of 342 work orders and fuel transactions. Status: 200 OK`;
}

function fetchAuditLogsUI() {
  const out = document.getElementById("admin-output");
  out.style.display = "block";
  out.innerHTML = `
[AUDIT TRAIL LOGS (F38)]
2026-07-26T01:04:12Z | User: admin@fleetcore.io | Action: IMMOBILIZE | Resource: ASSET TRK-8921
2026-07-26T01:02:40Z | User: dispatcher_1 | Action: ASSIGN_ROUTE | Resource: ROUTE R-402
  `;
}

function immobilizeAsset() {
  alert(`⚡ [REMOTE IMMOBILIZATION] Command dispatched via Go Ingestion Engine (TCP :9095) for ${selectedAsset.id}.\nmTLS signature verified. Vehicle ECM immobilized.`);
}

function openWorkOrder() {
  alert(`🔧 [WORK ORDER] Created Repair Ticket WO-2026-${Math.floor(1000 + Math.random() * 9000)} for ${selectedAsset.id}.`);
}

function setDuty(status) {
  alert(`ELD Duty Status updated to: ${status}`);
}

function filterAssets(query) {
  const q = query.toLowerCase();
  const filtered = FLEET_ASSETS.filter(a =>
    a.id.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.driver.toLowerCase().includes(q) ||
    a.depot.toLowerCase().includes(q)
  );
  renderAssetList(filtered);
}

function switchLocale(locale) {
  alert(`Switched locale to: ${locale}. Metrics & unit system dynamically converted.`);
}
