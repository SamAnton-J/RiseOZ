# LinkedX (MERN) – Full Project Guide

LinkedX is a MERN-stack professional networking and job marketplace with two roles: producers (job posters) and freelancers (job seekers). It includes JWT auth, protected dashboards, job CRUD, applicant viewing, connections, and real-time chat. Producers must pay a small platform fee in ETH (Sepolia) when posting a job (MetaMask only).

## Contents
- Overview and Tech Stack
- Environments and Required Variables
- Install and Run (Backend + Frontend)
- Seeding and Clearing the Database
- Project Structure and File-by-File Guide
- API Overview (selected endpoints)
- Blockchain Flow

## Overview and Tech Stack
- Frontend: React (Vite), React Router, Material UI, Axios, Ethers.js
- Backend: Node.js, Express, Mongoose, Socket.IO, JWT, Axios
- Database: MongoDB
- Blockchain: MetaMask (Ethereum Sepolia), Etherscan Sepolia verification

## Environments and Required Variables
- Backend `.env` (in `RiseOZ/backend/.env`):
  - `PORT=3000`
  - `MONGODB_URI=<your-mongodb-connection-uri>`
  - `JWT_SECRET=<your-strong-secret>`
  - `ETHERSCAN_API_KEY=<etherscan-sepolia-api-key>`
- Frontend `.env` (in `RiseOZ/frontend/.env`):
  - `VITE_API_BASE_URL=http://localhost:3000`
  - `VITE_ADMIN_WALLET_ADDRESS=0xYourSepoliaAdminAddress`
  - `VITE_PLATFORM_FEE_ETH=0.001`

## Install and Run
1) Backend
   - cd `RiseOZ/backend`
   - `npm install`
   - Add `.env`
   - Start: `npm start` → `http://localhost:3000`
2) Frontend
   - cd `RiseOZ/frontend`
   - `npm install`
   - Add `.env`
   - Start: `npm run dev` → `http://localhost:5173`

## Seeding and Clearing the Database
- Seed demo data (producer, 10 freelancers, 5 jobs with applicants):
  - cd `RiseOZ/backend`
  - `npm run seed`
  - Producer: `producer` / `Password123!`
  - Freelancers: `freelancer01..10` / `Password123!`
- Clear DB (wipe Producers, Freelancers, Jobs, ConnectionRequests, Messages):
  - `npm run clear-db`

## Project Structure and File-by-File Guide

Top-level
- `LICENSE` – Project license
- `README.md` – This guide
- `docs/GTM.md` – Go-to-market notes

Backend (`RiseOZ/backend`)
- `index.js` – Express + Socket.IO bootstrap; mounts all routes; starts server
- `package.json` – Scripts: `start`, `seed`, `clear-db`
- `config/db.js` – Connects to MongoDB using `MONGODB_URI`

Backend source (`RiseOZ/backend/src`)
- `ai/jobMatcher.js` – Placeholder for job matching logic
- `ai/skillExtractor.js` – Skill extraction helper (extendable)
- `blockchain/verifyTx.js` – `verifyTransactionOnEtherscanSepolia(txHash, apiKey)`
- `blockchain/wallet.js` – Helpers for admin wallet/fee if needed server-side

- `controllers/freelancer/freelancerAuth.js` – Freelancer signup/login + JWT
- `controllers/freelancer/freelancerControllers.js` – Freelancer actions (apply/list)
- `controllers/producer/producerAuth.js` – Producer signup/login + JWT
- `controllers/producer/producerControllers.js` – Job CRUD; optional tx verify; producer profile

- `middlewares/jwtAuth.js` – Validates `Authorization: Bearer <token>`; sets `req.user`

- `models/connection.js` – `ConnectionRequest` schema
- `models/freelancer.js` – `Freelancer` schema (profile, skills, appliedJobs, connections)
- `models/job.js` – `Job` schema (producer ref; title/description/requirements/skills; payment fields; applicants)
- `models/message.js` – `Message` schema for chat
- `models/producer.js` – `Producer` schema (profile/company/connections/jobsCreated)

- `routes/authRoute.js` – `/details`, `/profile-owner-details/:role/:username`
- `routes/channeliRoute.js` – Channel-specific routes
- `routes/chatRoute.js` – Chat REST endpoints
- `routes/connectionRoute.js` – Connection requests
- `routes/freelancerRoute.js` – Freelancer endpoints
- `routes/producerRoute.js` – Producer auth, job CRUD, profile endpoints

- `utils/aiRoutes.js` – AI-related routes
- `utils/authentication.js` – Auth helpers
- `utils/channeliControllers.js` – Channel controllers
- `utils/ChatControllers.js` – Chat helpers
- `utils/connectionControllers.js` – Connection controllers
- `utils/details.js` – JWT decode and profile owner details

- `scripts/seed.js` – Seeds producer, 10 freelancers (with bios/skills), and 5 jobs; links applicants
- `scripts/clearDb.js` – Clears key collections

Frontend (`RiseOZ/frontend`)
- `index.html` – Vite template
- `package.json` – Scripts and deps
- `vite.config.js` – Vite config
- `README.md` – Frontend notes

Frontend source (`RiseOZ/frontend/src`)
- `main.jsx` – App bootstrap
- `App.jsx` – App routes
- `App.css`, `index.css` – Global styles
- `assets/react.svg` – Asset

- `api/config.js` – Exports `API_BASE_URL`

- `ai/extractSkills.js` – Optional skill extraction helper

- `blockchain/useWallet.js` – MetaMask-only wallet hook (connect, ensureConnected, listeners)

- Components:
  - `Navbar.jsx`, `Loading.jsx`, `Chat.jsx`, `Signup.jsx`, `FreelancerSignin.jsx`, `ProducerSignin.jsx`

- Pages:
  - `Landing.jsx`, `SigninPage.jsx`, `SignupPage.jsx`
  - `FreelancerDashboard.jsx`, `ProducerDashboard.jsx` (job create + Sepolia payment)
  - `ChatView.jsx`, `PostDetail.jsx`, `ProfileDetail.jsx`

- Static styles: `static/css/components/*`, `static/css/pages/*`
- Public assets: images used across UI

## API Overview (selected endpoints)
- `GET /details` – decoded user info from JWT
- `GET /profile-owner-details/:role/:username` – populated profile by role/username
- Producer
  - `POST /producer/signup`, `POST /producer/login`
  - `POST /producer/jobs`, `GET /producer/jobs`, `GET /producer/jobs/:jobId`
  - `PUT /producer/jobs/:jobId`, `DELETE /producer/jobs/:jobId`
- Freelancer
  - `POST /freelancer/signup`, `POST /freelancer/login`
  - Other apply/list endpoints under `freelancerRoute`
- Connections – under `connectionRoute`
- Chat – Socket.IO + `chatRoute`

## Blockchain Flow (Sepolia)
- Frontend (Producer job creation):
  - Enforces MetaMask on Sepolia (chainId 11155111), switches or adds chain if needed
  - Sends 0.001 ETH to `VITE_ADMIN_WALLET_ADDRESS` via Ethers.js
  - Waits for confirmation, posts job with `transactionHash`, `paymentStatus: 'paid'`, `network: 'Ethereum Sepolia'`
- Backend verification (non-blocking):
  - Verifies tx via Etherscan Sepolia; logs issues but does not block job creation (MVP)

## Tips
- Ensure `.env` files are configured for both backend and frontend
- Use `npm run clear-db` then `npm run seed` for a clean demo state
