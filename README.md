<div align="center">

<img width="160" src="https://raw.githubusercontent.com/BlueByteRAMbo/Railfan-Content-Management-System/master/frontend/public/RF_Logo.png" alt="RCMS — Railfan Content Management System"/>

<h1>Railfan Archive Manager</h1>

<p><strong>A production-grade video archive system built for railfans, trainspotters, and content creators.</strong><br/>Track every locomotive. Map every journey. Never lose a recording.</p>

<p>
  <a href="#"><img src="https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=flat-square&logo=springboot&logoColor=white" alt="Spring Boot"/></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-C98A2C?style=flat-square" alt="MIT License"/></a>
</p>

<p>
  <a href="#-getting-started">Get Started</a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#️-tech-stack">Tech Stack</a> ·
  <a href="#️-production-deployment">Deploy</a>
</p>

</div>

---

## What Is This?

The **Railfan Archive Manager** replaces the spreadsheets, text files, and scattered notes that most railfans use to log their footage. It is a self-hosted, full-stack web application where you can:

- Log every video you've ever recorded — loco number, train, shed, station, date, GPS coordinates, file size, duration
- Automatically pull YouTube titles, descriptions, and thumbnails by pasting a video ID
- See every recording on an interactive map of India
- Track the "passport" of individual locomotives across your entire archive
- Plan your upload schedule and manage a pending queue
- Detect duplicates, resolve them, and bulk-manage hundreds of entries at once

It is built for personal use but architected for production — JWT auth, rate limiting, Flyway migrations, Caffeine caching, Prometheus metrics, and a full CI/CD pipeline out of the box.

---

## ✨ Key Features

### 🗂️ Archive & Logging
| Feature | Description |
|---|---|
| **Quick Add Mode** | Lightning-fast sequential entry — log a full session without touching your mouse |
| **Google Takeout Import** | Drop your `videos.csv` directly — the backend detects format and imports instantly |
| **Mass Import / Export** | Excel, CSV, and PDF export for your entire archive or filtered subsets |
| **Duplicate Detection** | Backend daemon flags same-train, same-day duplicates automatically |
| **Bulk Actions** | Multi-select hundreds of videos — Archive, Delete, Mark Uploaded, Schedule |

### 🚂 Locomotive & Train Intelligence
| Feature | Description |
|---|---|
| **Locomotive Logbook** | A "passport" for every loco — full appearance history, every train, every shed, every livery |
| **Train Run Tracker** | Group appearances of the same train across dates; detects loco swaps automatically |
| **Offlink Detector** | Flags when a train runs with an unexpected locomotive — configure expected assignments per train |
| **Spotter Map** | All GPS-tagged recordings on an interactive Leaflet map, clustered by traction type |

### 📊 Analytics & Planning
| Feature | Description |
|---|---|
| **Deep Statistics** | Recharts visualisations of top locos, trains, sheds, stations — filterable by date range |
| **Upload Planner** | Schedule your YouTube releases; see gaps at a glance |
| **Pending Queue** | Workflow view for unuploaded footage with inline bulk actions |
| **Interactive Calendar** | Recording and upload calendar with day-level drill-down |
| **Timeline View** | Monthly recording/upload bars — click any month to see its videos |

### 🔧 Infrastructure
| Feature | Description |
|---|---|
| **YouTube Metadata Scraping** | Paste a video ID — title, description, duration, and thumbnail fill automatically. No API key needed |
| **7 000+ Station Search** | Full Indian Railways station database seeded on first boot; live-search dropdown in every form |
| **Caching** | Caffeine in-memory cache on dashboard, stats, and YouTube calls |
| **Rate Limiting** | Bucket4j per-user JWT-aware limiting + Nginx IP-level limiting on auth endpoints |
| **Metrics** | Spring Actuator + Micrometer Prometheus endpoint — plug into Grafana Cloud |
| **PWA** | Installable on Android/iOS; reference data cached offline via Workbox |
| **API Docs** | OpenAPI / Swagger UI auto-generated at `/swagger-ui.html` |
| **CI/CD** | GitHub Actions: build → test → deploy on every push to `master` |

---

## 🛠️ Tech Stack

### Backend
| | |
|---|---|
| **Runtime** | Java 21 |
| **Framework** | Spring Boot 3.3.4 |
| **Security** | Spring Security · JWT (JJWT) · Bucket4j rate limiting |
| **Database** | PostgreSQL 15 · Hibernate JPA · Flyway migrations |
| **Exports** | Apache POI (Excel) · OpenCSV · iText (PDF) |
| **Monitoring** | Spring Actuator · Micrometer · Prometheus |

### Frontend
| | |
|---|---|
| **Framework** | React 19 + Vite 8 · TypeScript 5 |
| **Styling** | Tailwind CSS · Framer Motion |
| **Data** | TanStack Query · Zustand |
| **UI** | Radix UI · Shadcn · Recharts · React Leaflet · Lucide Icons |
| **PWA** | Vite PWA Plugin · Workbox |

### Infrastructure
| | |
|---|---|
| **Containers** | Docker · Docker Compose |
| **Proxy** | Nginx (rate limiting, gzip, SPA routing, API proxying) |
| **CI/CD** | GitHub Actions |
| **Hosting** | Render · Railway · any VPS |

---

## 🚀 Getting Started

### Prerequisites

- **Java** JDK 21+
- **Node.js** v18+
- **Maven** (optional — wrapper included)

### 1 — Start the Backend

The local profile uses an H2 in-memory database. No PostgreSQL or Docker needed. On first boot, all 7 000+ Indian railway stations are seeded automatically.

**macOS / Linux:**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=local
```

**Windows (no system Maven needed):**
```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=local"
```

Default credentials seeded automatically:

| Username | Password |
|---|---|
| `railfan` | `railfan123` |

### 2 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ☁️ Production Deployment

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:<port>/<db>
SPRING_DATASOURCE_USERNAME=<user>
SPRING_DATASOURCE_PASSWORD=<strong-password>

# Security — must be at least 256 bits, randomly generated
JWT_SECRET=<long-random-string>

# Optional
YOUTUBE_API_KEY=
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

> ⚠️ **Never leave `JWT_SECRET` unset in production.** The app will refuse to start if this variable is missing.

### Docker (Full Stack)

```bash
cp .env.example .env
# Edit .env with your values, then:
docker-compose -f docker-compose.prod.yml up -d
```

This starts PostgreSQL, the Spring Boot backend, the Nginx frontend, and wires everything together.

### Render / Railway (Backend only)

1. Set all environment variables in the platform dashboard
2. Point the build to `backend/` with:
   - **Build command:** `mvn -B package -DskipTests`
   - **Start command:** `java -jar target/*.jar`
3. Flyway runs on startup and creates all tables automatically

### Vercel / Netlify (Frontend only)

1. Root directory: `frontend/`
2. Build command: `npm run build`
3. Output directory: `dist/`
4. Set `VITE_API_URL=https://your-backend-domain.com`

---

## 🔐 Security Notes

- Passwords hashed with BCrypt (strength 12)
- Stateless JWT sessions — no CSRF exposure
- Per-user Bucket4j rate limiting (200 req/min) + Nginx IP rate limiting (5 req/min on auth)
- All data is user-scoped — every query filters by authenticated user
- CORS restricted to configured origins only
- Pagination size capped at 100 per request

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add: description of your feature'
   ```
4. Push and open a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

Please open an issue first for anything beyond small bug fixes so we can discuss the approach.

---

## 📄 License

Distributed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <sub>Built with ❤️ for the Indian Railfan Community</sub><br/>
  <sub>
    <a href="#-getting-started">Get Started</a> ·
    <a href="https://github.com/BlueByteRAMbo/Railfan-Content-Management-System/issues">Report a Bug</a> ·
    <a href="https://github.com/BlueByteRAMbo/Railfan-Content-Management-System/issues">Request a Feature</a>
  </sub>
</div>