# CsetFlix

CsetFlix is a modern web application that was made for movie browsing. It integrates with The Movie Database (TMDB) for movie information.

## Features

- Browse trending and popular movies
- Search for movies by title
- View detailed movie information
- Network-accessible interface

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

