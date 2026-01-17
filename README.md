# Trace 🌍
Trace is a **map-first travel identity platform** where users build
a personal world graph of places they’ve visited.

Each place is represented as a **node on the world map**, backed by
verifiable proof via Google Drive photo references.

This repository currently contains the **foundational backend architecture**
and infrastructure setup.

## Core Idea

- 🌍 Interactive world map as the primary interface
- 📍 Place nodes represent visited locations
- 🧭 Travel edges represent journeys between places
- 🗂️ Place vaults store notes and proof photo references
- 🔒 Privacy-first: no media files are stored, only metadata

## Architectural Overview
- Spatial + graph-backed data model (PostgreSQL + PostGIS)
- Clean separation of concerns
- External integrations isolated via dedicated modules
- Modular monolith backend (NestJS)

## Tech Stack

### Backend
- Node.js (LTS)
- NestJS
- TypeScript
- PostgreSQL + PostGIS
- Prisma ORM (v7)

### Infrastructure
- Docker (local development)
- Google OAuth (planned)
- Google Drive API (planned)
- Map provider (planned)

## Features
- User authentication (WIP)
- Travel place nodes
- Travel edges between places
- Place vaults for notes and photos

## System Context Diagram

![System Context Diagram](./docs/System-Context-diagram.png)

## High Level Design

![High Level Design](./docs/HLD.png)

## ER Diagram

![ER Diagram](./docs/ErDiagram.png)

## Current Status

✅ Architecture & domain design  
✅ Dockerized database (PostgreSQL + PostGIS)  
✅ Prisma configured and connected  
✅ NestJS project structure initialized  

🚧 Authentication (Google OAuth) — next  
🚧 Core APIs (nodes, edges, vaults)  
🚧 Map-first frontend experience  

## Development Setup

```bash
# install dependencies
npm install

# start database
docker compose up -d

# start backend
npm run start:dev

