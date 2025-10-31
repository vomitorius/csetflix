# CsetFlix

CsetFlix is a modern web application that was made for movie browsing. It integrates with The Movie Database (TMDB) for movie information.

## Features

- Browse trending and popular movies
- Search for movies by title
- View detailed movie information
- **Native WebTorrent streaming** - Stream torrents directly in the browser without external services
- Network-accessible interface
- Real-time torrent statistics (peers, download/upload speed)

## Tech Stack

- Nuxt 3 (Vue 3)
- TypeScript
- Tailwind CSS with DaisyUI
- Pinia for state management
- The Movie Database API for movie data
- **WebTorrent** for native browser-based torrent streaming

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
- Stream torrents directly in your browser using the Ncore integration

## Streaming

CsetFlix now uses **native WebTorrent** for browser-based streaming:

- **No external services** - Streams torrents directly in your browser
- **Fast** - Streaming starts in < 3 seconds
- **Accurate** - Always plays the correct video file
- **Full control** - Native HTML5 video player with complete playback control
- **Real-time stats** - View peers, download/upload speeds

### Testing

Visit `/test-ncore-webtorrent` to test the native WebTorrent implementation with a sample torrent.
