# CsetFlix

CsetFlix is a modern web application that was made for movie browsing. It integrates with The Movie Database (TMDB) for movie information.

## Features

- Browse trending and popular movies
- Search for movies by title
- View detailed movie information
- Network-accessible interface
- **Ncore.pro Integration** - Search and stream torrents directly from ncore.pro

## Tech Stack

- Nuxt 3 (Vue 3)
- TypeScript
- Tailwind CSS with DaisyUI
- Pinia for state management
- The Movie Database API for movie data

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/csetflix.git
cd csetflix
```

2. Install dependencies
```bash
npm install
```

3. Create an environment file
```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file:
   - Get a TMDB API key from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
   - Set up qBittorrent Web UI credentials
   - Configure file paths
   - **Ncore.pro credentials** - Add your ncore.pro username and password for torrent search functionality

5. **Optional:** Python dependencies are no longer required for Ncore integration (now uses TypeScript/Node.js)

6. Run the development server
```bash
# Run locally
npm run dev

# Run with network access
./start-network.sh
```

## Usage

- Visit the homepage to see trending movies
- Use the search feature to find specific titles
- Click on a movie to view details
- Click on "Ncore" button on movie detail page to search and stream from ncore.pro (requires valid ncore.pro account)
- **New:** Ncore integration now runs natively in Node.js (no Python required)

