# CsetFlix

CsetFlix is a modern web application that combines movie browsing with torrent downloading capabilities. It integrates with The Movie Database (TMDB) for movie information and qBittorrent for download management.

## Features

- Browse trending and popular movies
- Search for movies by title
- View detailed movie information
- Find torrents for movies and download them directly to qBittorrent
- Network-accessible interface

## Tech Stack

- Nuxt 3 (Vue 3)
- TypeScript
- Tailwind CSS with DaisyUI
- Pinia for state management
- The Movie Database API for movie data
- qBittorrent integration via Web API
- Server-side torrent search

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

5. Run the development server
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
- Click "Download" to find available torrents and send to qBittorrent

## Notes

This application is for educational purposes only. Be aware of copyright laws in your country before downloading any content.

## License

MIT
