# SpotifAI

Your complete Spotify listening profile — top tracks, artists, albums, and listening trends across eras.  
Supports combining **multiple Spotify accounts** into a single aggregate profile.

## Features

- **Top Tracks / Artists / Albums** — see your most listened-to music for the last 4 weeks, 6 months, or all time
- **Multi-account aggregation** — connect multiple Spotify accounts and merge their rankings into one combined profile. Songs/artists appearing across accounts get boosted scores.
- **Trends & Eras** — compare your sound profile (energy, mood, danceability) across time periods, track artist trajectories, and see your most consistent genres
- **Audio features radar chart** — visualize how your taste has evolved
- **Genre charts** — ranked bar chart of your top genres per era

## Setup

### 1. Create a Spotify Developer App

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Click **Create app**
3. Set a name and description
4. Add `http://localhost:5173/callback` as a **Redirect URI**
5. Save and copy your **Client ID**

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and paste your Client ID:
```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Multi-account usage

1. Connect your first Spotify account via the landing page
2. Go to **Accounts** → click **Add Account** (Spotify will ask you to log in again — use a different account)
3. Both accounts appear as toggleable chips on the Dashboard
4. The aggregate profile weights items by their ranking position across all selected accounts

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Recharts (radar & bar charts)
- Zustand (state management + localStorage persistence)
- Spotify Web API with PKCE OAuth (no backend required)
