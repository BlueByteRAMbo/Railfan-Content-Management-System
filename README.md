<div align="center">
  <img src="https://img.icons8.com/color/120/train.png" alt="Railfan Archive Manager Logo" />
  
  # 🚂 Railfan Archive Manager
  
  **A production-grade, full-stack video management system built for railfans, trainspotters, and content creators.**

  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?logo=spring&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](#)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](#)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](#)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](#)
</div>

---

## 📖 Overview

The **Railfan Archive Manager** is an enterprise-grade CMS designed specifically for train enthusiasts to replace messy text-file tracking systems. It allows users to track, organize, and analyze high volumes of train recording data, syncing automatically with YouTube metadata, visualizing upload velocity, and offering deep analytics.

### ✨ Key Features

- 📹 **YouTube Metadata Sync**: Paste a YouTube Video ID to automatically extract Title, Description, Duration, and high-quality Thumbnail art.
- 🚀 **Quick Add Mode**: Lightning-fast, sequential data entry forms designed for logging massive backlogs without touching your mouse.
- 📊 **Deep Analytics**: View your top recorded trains, locomotives, sheds, and stations via interactive Recharts visualizations.
- 📅 **Temporal Workflows**: Dedicated Upload Planner, Pending Queues, and Interactive Calendars to track exactly when and what you recorded/uploaded.
- 📥 **Mass Import & Export**: Drag-and-drop legacy Excel/CSV files to populate the database, or export your entire archive to a formatted PDF.
- 🚨 **Duplicate Resolution**: Automated backend daemon that flags and alerts you of potential duplicate recordings (e.g., same train on the same day).

---

## 🛠️ Tech Stack

### **Backend (Java)**
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security + JWT Authentication
- **Database**: PostgreSQL (via Spring Data JPA / Hibernate)
- **Migrations**: Flyway
- **Integrations**: Google YouTube Data API v3, Apache POI, OpenCSV, iText PDF

### **Frontend (TypeScript)**
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State/Fetching**: Zustand + TanStack Query (React Query)
- **Charts/UI**: Recharts, React-Calendar, Lucide Icons

### **Infrastructure**
- Docker & Docker Compose
- Nginx Reverse Proxy

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Java (JDK 21)
- Docker Desktop (Optional, for database)

### 1. Database Setup
Spin up a local PostgreSQL database using Docker:
```bash
docker-compose up db -d
```

### 2. Backend Setup
1. Duplicate `.env.example` to `.env` in the root folder and add your credentials (including your `YOUTUBE_API_KEY`).
2. Navigate to the backend folder and run it:
```bash
cd backend
./mvnw spring-boot:run
```
*Note: Flyway will automatically execute migrations and build your tables on the first run.*

### 3. Frontend Setup
1. Navigate to the frontend folder:
```bash
cd frontend
```
2. Install dependencies and start the dev server:
```bash
npm install
npm run dev
```
3. Visit `http://localhost:5173` in your browser.

---

## ☁️ Production Deployment

This application is ready to be deployed to cloud platforms like **Render**, **Railway**, or any standard VPS. 

It includes:
- `docker-compose.prod.yml` for unified Docker Swarm / compose deployment.
- `nginx/nginx.conf` customized for Vite SPA routing and backend proxying.

> **See `RENDER_DEPLOYMENT.md` for a comprehensive, step-by-step guide to deploying this stack for free.**

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <i>Built with ❤️ for the Railfan Community</i>
</div>
