<div align="center">
  <img src="https://img.icons8.com/color/120/train.png" alt="Railfan Archive Manager Logo" />
  
  # 🚂 Railfan Archive Manager
  
  **A production-grade, full-stack video management system built for railfans, trainspotters, and content creators.**

  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?logo=spring&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](#)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](#)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](#)
</div>

---

## 📖 Overview

The **Railfan Archive Manager** is an enterprise-grade CMS designed specifically for train enthusiasts to replace messy text-file tracking systems. It lets users track, organise, and analyse high volumes of train recording data — syncing automatically with YouTube metadata, visualising upload velocity, and offering deep analytics.

### ✨ Key Features

- 🔍 **Searchable Station Picker**: A live search dropdown backed by a full Indian Railways station database (7 000+ stations). Type any station name or code and get instant results from the backend — zero client-side JSON bundle.
- 🆓 **API-Free YouTube Metadata Scraping**: Paste a YouTube Video ID to automatically extract Title, Description, Duration, and high-quality Thumbnail — no paid API key required.
- 📤 **Google Takeout Auto-Importer**: Drop your raw `videos.csv` from Google Takeout directly into the dashboard. The backend automatically detects the format and builds your database instantly.
- 🚀 **Quick Add Mode**: Lightning-fast sequential data entry designed for logging massive backlogs without touching your mouse.
- 🗃️ **Mass Import & Export**: Import legacy Excel/CSV files. Export your entire archive to PDF reports, Excel spreadsheets, or CSV backups.
- 📦 **Bulk Action Engine**: Multi-select hundreds of videos using checkboxes, then Archive or Delete them with a floating action bar.
- 📊 **Deep Analytics Dashboard**: Interactive Recharts visualisations of top trains, locos, sheds, and stations. Compare upload velocity vs. recording frequency.
- 📅 **Temporal Workflows**: Upload Planner, Pending Queues, and an Interactive Calendar to track what you recorded and when.
- 🚨 **Duplicate Detection**: Automated backend daemon flags potential duplicate recordings (same train, same day).

### 🎨 Design & UX
- **"Signal & Steel" Identity**: Deep Charcoal/Graphite base with vibrant Signal Amber accents.
- **Framer Motion**: Staggered page loads, layout transitions, animated stat counters.
- **Glassmorphism**: Backdrop-blur card layouts and glowing hover states over a radial mesh background.
- **Mobile-First**: Off-canvas drawer sidebar, bottom navigation, and touch-friendly stacked cards on small screens.

---

## 🛠️ Tech Stack

### Backend (Java)
| | |
|---|---|
| **Framework** | Spring Boot 3.3.4 |
| **Security** | Spring Security + JWT |
| **Database** | PostgreSQL (JPA / Hibernate) |
| **Migrations** | Flyway |
| **Extras** | Apache POI · OpenCSV · iText PDF · HTML Scraper |

### Frontend (TypeScript)
| | |
|---|---|
| **Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **State / Fetching** | Zustand + TanStack Query |
| **UI** | Radix UI · Recharts · react-select · Lucide Icons |

### Infrastructure
- Docker & Docker Compose
- Nginx Reverse Proxy

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** v18+
- **Java** JDK 21
- **Maven** (optional — see below)

### 1. Start the Backend (H2 in-memory, no Docker required)

> On first boot the seeder automatically imports all 7 000+ Indian railway stations into the in-memory database.

**If Maven is on your PATH:**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=local
```

**Without a system Maven (Windows):**
```powershell
# One-time: the bundled wrapper downloads Maven 3.9.6 automatically
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=local"
```

**Or use a locally downloaded Maven:**
```powershell
& "$env:USERPROFILE\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run `
    "-Dspring-boot.run.arguments=--spring.profiles.active=local"
```

Default credentials seeded automatically:
| Username | Password |
|---|---|
| `railfan` | `railfan123` |

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## ☁️ Production Deployment

The app is ready to deploy to **Render**, **Railway**, or any VPS.

### Environment Variables (`.env` — copy from `.env.example`)

```
DB_URL=jdbc:postgresql://<host>:<port>/<db>
DB_USERNAME=<user>
DB_PASSWORD=<pass>
JWT_SECRET=<long-random-string>
```

### Docker Compose (full stack)

```bash
# Copy and fill in .env first
cp .env.example .env

# Start everything (Postgres + Backend + Frontend + Nginx)
docker-compose -f docker-compose.prod.yml up -d
```

### Backend-only (Render / Railway)

1. Set the env vars above in your platform dashboard.
2. Point the build to `backend/` with:
   - **Build command**: `mvn -B package -DskipTests`
   - **Start command**: `java -jar target/*.jar`
3. Flyway runs automatically on first startup and seeds all tables.

### Frontend-only (Vercel / Netlify)

1. Root directory: `frontend/`
2. Build command: `npm run build`
3. Output directory: `dist/`
4. Set `VITE_API_URL=https://<your-backend-domain>` if you use a separate backend host.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <i>Built with ❤️ for the Railfan Community</i>
</div>
