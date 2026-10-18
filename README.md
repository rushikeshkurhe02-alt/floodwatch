# FloodWatch

> "Community-verified flood reports. Nobody is trusted until three people agree."

FloodWatch is a real-time, community-driven monsoon waterlogging and road flooding monitor for neighbourhoods. Residents drop pins on flooded roads with severity levels, other residents verify them, and reports automatically transition to **Verified** status once 3 independent confirmations are reached.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and supply your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(Alternatively, launch the app directly and enter your credentials in the interactive setup screen.)*

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 5-Line Demo Script

1. **Browse without login**: Open the map centered on Pune, India to view existing color-coded flood reports and filter by severity or verification status.
2. **Authenticate**: Click **Log In** in the top navbar and create an account or sign in with your email and password.
3. **Drop a Flood Pin**: Click **Report Flooded Road**, tap any road segment on the map, select the water depth (Low, Medium, or High), add an optional landmark note, and click **Publish Report**.
4. **Community Confirmation**: Sign in from a second browser account to verify the report—notice the confirmation counter increment from `0/3` to `1/3` and `2/3`.
5. **Real-time "Trust Nobody" Flip**: On the 3rd independent confirmation, Supabase database triggers automatically elevate the report to `Verified` (solid green ring) and trigger an instant live toast across all connected devices.
