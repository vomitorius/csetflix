#!/usr/bin/env python3
"""
Ncore.pro search script
Searches for movies on ncore.pro and returns results as JSON
"""
import sys
import json
import os
from ncoreparser import Client, SearchParamType, ParamSort, ParamSeq

def search_movie(movie_title, username, password):
    """Search for a movie on ncore.pro"""
    try:
        client = Client()
        client.login(username, password)
        
        # Search in HD Hungarian category first (most likely for movies)
        results = []
        
        # Try different search types
        search_types = [
            SearchParamType.HD_HUN,  # HD Hungarian
            SearchParamType.HD_ENG,  # HD English
            SearchParamType.SD_HUN,  # SD Hungarian
            SearchParamType.SD_ENG,  # SD English
        ]
        
        for search_type in search_types:
            try:
                search_result = client.search(
                    pattern=movie_title,
                    type=search_type,
                    sort_by=ParamSort.SEEDERS,
                    sort_order=ParamSeq.DECREASING,
                )
                
                # Add top results from each category
                for torrent in search_result.torrents[:5]:  # Top 5 from each category
                    results.append({
                        'id': torrent.get('id', ''),
                        'title': torrent.get('title', ''),
                        'type': torrent.get('type', ''),
                        'size': torrent.get('size', ''),
                        'seeders': int(torrent.get('seeders', 0)),
                        'leechers': int(torrent.get('leechers', 0)),
                        'uploaded': torrent.get('uploaded', ''),
                        'url': torrent.get('url', ''),
                    })
            except Exception as e:
                # Continue if a specific search type fails
                print(f"Warning: Search failed for type {search_type}: {e}", file=sys.stderr)
                continue
        
        client.logout()
        
        # Sort all results by seeders
        results.sort(key=lambda x: x['seeders'], reverse=True)
        
        return {
            'success': True,
            'torrents': results[:20],  # Return top 20 results
            'count': len(results)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'torrents': []
        }

def main():
    if len(sys.argv) < 4:
        print(json.dumps({
            'success': False,
            'error': 'Usage: ncore_search.py <movie_title> <username> <password>'
        }))
        sys.exit(1)
    
    movie_title = sys.argv[1]
    username = sys.argv[2]
    password = sys.argv[3]
    
    result = search_movie(movie_title, username, password)
    print(json.dumps(result))

if __name__ == '__main__':
    main()
