Go-To-Market Notes (stub)

- Signup captures LinkedIn, wallet, and skills. Producers can add company website.
- Producers pay a small on-chain fee before job creation; tx hash stored with the job.
- AI utilities:
  - Skill extraction endpoint: POST /ai/extract-skills { text }
  - Match score computed server-side for freelancer job feed.
- Env variables:
  - Backend: JWT_SECRET, ADMIN_WALLET_ADDRESS, PLATFORM_FEE_ETH, POLYGONSCAN_API_KEY
  - Frontend: VITE_ADMIN_WALLET_ADDRESS, VITE_PLATFORM_FEE_ETH

