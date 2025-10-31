# Ncore.pro Integration - Manual Test Guide

This document provides instructions for manually testing the Ncore.pro integration feature.

## Prerequisites

1. Valid Ncore.pro account credentials
2. **No Python required!** - Ncore integration now runs natively in Node.js/TypeScript
3. Ncore credentials configured in `.env` file:
   ```bash
   NCORE_USERNAME=your_ncore_username
   NCORE_PASSWORD=your_ncore_password
   ```

## Test Scenarios

### 1. API Endpoint Testing

**Note:** Python scripts are no longer used. All functionality is implemented in TypeScript/Node.js.

Start the development server:
```bash
npm run dev
```

Test the search endpoint:
```bash
curl "http://localhost:3000/api/ncore/search?title=Matrix"
```

**Expected Success Response:**
```json
{
  "success": true,
  "torrents": [...],
  "count": 10
}
```

**Expected Error (no credentials):**
```json
{
  "success": false,
  "error": "Ncore credentials not configured. Please set NCORE_USERNAME and NCORE_PASSWORD in .env file"
}
```

### 3. UI Testing

1. **Navigate to a Movie Detail Page**
   - Open the application: `http://localhost:3000`
   - Click on any movie from the trending section
   - Alternatively, tap the "Release Date" field 3 times to reveal watch options

2. **Verify Ncore Button is Visible**
   - The watch options section should display three buttons in order:
     1. **Green "Ncore" button** (NEW - positioned first)
     2. Blue "Watch" button
     3. Gray "Download Options" button

3. **Test Ncore Search Flow**
   - Click the green "Ncore" button
   - **Expected:** Ncore search modal opens
   - **Expected:** Modal shows loading spinner with "Ncore keresés..." text
   - **Expected:** Search results appear sorted by seeders (descending)
   - Each result should display:
     - Title
     - Seeders (green) and Leechers (red)
     - File size
     - Category badge
     - Green "Lejátszás" button

4. **Test Torrent Selection**
   - Click "Lejátszás" on any torrent
   - **Expected:** Modal closes
   - **Expected:** Ncore Stream Player opens
   - **Expected:** Player shows:
     - Green "NCORE" badge in header
     - Movie title
     - Loading state while initializing Webtor player
     - "Forrás: Ncore.pro" in footer

5. **Test Playback**
   - **Expected:** Video starts playing after torrent metadata loads
   - **Expected:** Standard video controls are available
   - **Expected:** Fullscreen button works
   - **Expected:** Close button (×) stops playback and closes player

### 4. Error Handling Testing

1. **Test with Invalid Credentials**
   - Set incorrect credentials in `.env`
   - Click Ncore button
   - **Expected:** Error modal with message about authentication failure

2. **Test with Movie Not Found**
   - Search for an obscure/non-existent movie
   - Click Ncore button
   - **Expected:** "Nincs találat" (No results) message

3. **Test Network Error**
   - Disconnect from internet
   - Click Ncore button
   - **Expected:** Error message displayed

## Visual Verification Checklist

- [ ] Green "Ncore" button appears before "Watch" button
- [ ] Button has search icon and "Ncore" text
- [ ] Modal has green "NCORE" badge
- [ ] Modal displays Hungarian text (as per requirements)
- [ ] Results show seeders/leechers with appropriate colors
- [ ] Player has green "NCORE" badge
- [ ] Player shows "Forrás: Ncore.pro" text
- [ ] All buttons are responsive and clickable

## Component Integration Points

### Movie Detail Page (`pages/movie/[id].vue`)
- Imports: `NcoreSearchModal`, `NcoreStreamPlayer`
- Button placement: Line ~183 (before Watch button)
- Event handlers: `openNcoreSearch()`, `closeNcoreSearch()`, `playNcoreTorrent()`, `closeNcorePlayer()`

### Server API Endpoints
- `/api/ncore/search` - Searches torrents by movie title
- `/api/ncore/magnet` - Gets magnet link from torrent ID

### Python Scripts
- `server/scripts/ncore_search.py` - Executes search using ncoreparser
- `server/scripts/ncore_magnet.py` - Downloads torrent file and converts to magnet link

## Known Limitations

1. Requires valid Ncore.pro account
2. Ncore credentials are stored in `.env` file (server-side only for security)
3. Python must be installed on the server
4. Search is limited to movie categories (HD_HUN, HD_ENG, SD_HUN, SD_ENG)
5. Returns maximum 20 results sorted by seeders

## Troubleshooting

### "Ncore credentials not configured" Error
- Verify `.env` file exists with correct credentials
- Restart development server after updating `.env`
- Check `nuxt.config.ts` has `ncoreUsername` and `ncorePassword` in runtimeConfig

### TypeScript Client Fails
- Check server logs for detailed error messages
- Verify credentials are correct in `.env` file
- Ensure ncore.pro is accessible from your network

### Search Returns No Results
- Verify credentials are correct
- Try searching for popular movies (e.g., "Matrix", "Inception")
- Check if Ncore.pro is accessible from your network

### Player Doesn't Load
- Check browser console for errors
- Verify magnet link was generated correctly
- Try opening the Webtor.io link directly using the "Megnyitás Webtor.io-n" button
