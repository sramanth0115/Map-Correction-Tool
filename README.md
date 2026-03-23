# 🗺️ Map Data Correction Tool

A full-stack GIS web application that simulates the real workflow used by mapping analysts at navigation companies like Google Maps, MapMyIndia, HERE Technologies, and TomTom.

---

## 🎯 What This Project Does

This tool allows GIS analysts to:
- Visually identify map errors on an interactive map
- Correct them through a form-based interface
- Track every correction in a structured audit log
- Draw missing roads as polylines
- Drag markers to correct wrong locations
- Calculate distances using the Haversine formula

## 📦 Pre-loaded Test Cases

Three errors are pre-loaded when the app starts:

| ID | Error | Description |
|---|---|---|
| LOC-001 | Wrong Road Name | "Main Rd" should be "Main Road" |
| LOC-002 | Wrong Business Location | ABC Cafe placed at wrong coordinates |
| LOC-003 | Missing Road | New road not shown on map (dashed red) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ ([nodejs.org](https://nodejs.org))
- npm (comes with Node.js)
- MongoDB (optional — app works without it using in-memory storage)

---

### Step 1 — Start the Backend

```bash
cd backend
npm install
node server.js
```

The server starts at `http://localhost:5000`

> **MongoDB is optional.** Without it, corrections are stored in memory (lost on restart). To enable persistence, see MongoDB Setup below.

---

### Step 2 — Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000` 🎉

---

## 🗄️ MongoDB Setup (Optional)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Create `backend/.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/map_correction_tool
PORT=5000
```

---

## 🗂️ Project Structure

```
map-correction-tool/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.jsx              ← Interactive Leaflet map
│   │   │   ├── Sidebar.jsx          ← Tab container
│   │   │   ├── EditForm.jsx         ← Correction form
│   │   │   ├── CorrectionLog.jsx    ← Audit log
│   │   │   ├── StatsPanel.jsx       ← Dashboard stats
│   │   │   └── DistanceCalculator.jsx ← Haversine calculator
│   │   ├── App.jsx                  ← Main app & state
│   │   ├── App.css                  ← All styles
│   │   └── index.js                 ← Entry point
│   └── package.json
├── backend/
│   ├── models/
│   │   └── Correction.js            ← MongoDB schema
│   ├── routes/
│   │   └── corrections.js           ← REST API routes
│   ├── server.js                    ← Express server
│   ├── .env.example                 ← Environment variables template
│   └── package.json
└── README.md
```

---

## 🛠️ Technologies Used

### Frontend
- **React 18** — Component-based UI
- **Leaflet.js** — Interactive map with OpenStreetMap tiles
- **Axios** — HTTP client for API calls
- **CSS Variables** — Theming and styling

### Backend
- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **MongoDB + Mongoose** — Database and ODM (optional)

### GIS Concepts
- **Leaflet Markers** — Colour-coded by status
- **Polylines** — Road representation
- **Haversine Formula** — Distance calculation
- **Coordinate System** — WGS84 (lat/lng)

---

## 🎮 How to Use

1. **Select mode** — Click markers on map to inspect
2. **Edit mode** — Opens draggable markers for repositioning
3. **Add Road mode** — Click multiple points to draw a new road, then click "Confirm Road"
4. **Flag Error mode** — Click anywhere to flag a new error

### Sidebar Tabs
- **✏️ Edit** — Fill in correction details and save
- **📋 Log** — View all saved corrections with audit trail
- **📊 Stats** — Live dashboard with completion stats
- **📐 Calc** — Distance calculator with Haversine formula

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/corrections` | Fetch all corrections |
| POST | `/api/corrections` | Save a new correction |
| PUT | `/api/corrections/:id` | Update a correction |
| DELETE | `/api/corrections/:id` | Delete a correction |
| GET | `/api/health` | Server health check |

---

## 💼 Resume Description

> **Map Data Correction Tool** — GIS Web Application  
> Developed a full-stack GIS-based map data correction tool that simulates the real workflow used by mapping analysts at navigation companies. Built an interactive map interface using React and Leaflet.js where analysts can identify, edit, and resolve map errors including wrong road names, incorrect business locations, missing roads, and wrong coordinates. Implemented a correction log with audit trail, colour-coded error markers, polyline road drawing, drag-and-drop marker repositioning, and a distance calculator using the Haversine formula. Connected to MongoDB via Node.js and Express for persistent correction record storage. Included 3 pre-loaded test cases to demonstrate the complete error detection and resolution workflow end to end.

---

## 🏷️ Skills Demonstrated

- React component architecture
- Leaflet.js GIS integration
- REST API with Node.js + Express
- MongoDB database operations
- Haversine formula implementation
- GIS concepts: coordinates, polylines, spatial data
- Data quality management and audit trails
