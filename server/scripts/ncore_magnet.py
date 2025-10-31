#!/usr/bin/env python3
"""
Ncore.pro magnet link generator
Downloads torrent file and generates magnet link
"""
import sys
import json
import os
import tempfile
import hashlib
import bencodepy
from ncoreparser import Client

def torrent_file_to_magnet(torrent_path):
    """Convert a torrent file to a magnet link"""
    try:
        with open(torrent_path, 'rb') as f:
            torrent_data = bencodepy.decode(f.read())
        
        info = torrent_data[b'info']
        info_hash = hashlib.sha1(bencodepy.encode(info)).hexdigest()
        
        # Get name
        name = info[b'name'].decode('utf-8')
        
        # Build magnet link
        magnet = f"magnet:?xt=urn:btih:{info_hash}&dn={name}"
        
        # Add trackers if available
        if b'announce' in torrent_data:
            tracker = torrent_data[b'announce'].decode('utf-8')
            magnet += f"&tr={tracker}"
        
        if b'announce-list' in torrent_data:
            for tier in torrent_data[b'announce-list']:
                for tracker in tier:
                    tracker_url = tracker.decode('utf-8')
                    magnet += f"&tr={tracker_url}"
        
        return magnet
    except Exception as e:
        raise Exception(f"Failed to convert torrent to magnet: {e}")

def get_magnet_link(torrent_id, username, password):
    """Download torrent file and convert to magnet link"""
    temp_dir = None
    try:
        client = Client()
        client.login(username, password)
        
        # Create temporary directory for torrent file
        temp_dir = tempfile.mkdtemp()
        
        # Download torrent (we need to pass a torrent dict with 'id' key)
        torrent_dict = {'id': torrent_id}
        torrent_path = client.download(torrent_dict, temp_dir)
        
        # Convert to magnet link
        magnet_link = torrent_file_to_magnet(torrent_path)
        
        client.logout()
        
        # Clean up
        if os.path.exists(torrent_path):
            os.remove(torrent_path)
        
        return {
            'success': True,
            'magnet': magnet_link
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
    finally:
        # Clean up temp directory
        if temp_dir and os.path.exists(temp_dir):
            try:
                os.rmdir(temp_dir)
            except:
                pass

def main():
    if len(sys.argv) < 4:
        print(json.dumps({
            'success': False,
            'error': 'Usage: ncore_magnet.py <torrent_id> <username> <password>'
        }))
        sys.exit(1)
    
    torrent_id = sys.argv[1]
    username = sys.argv[2]
    password = sys.argv[3]
    
    result = get_magnet_link(torrent_id, username, password)
    print(json.dumps(result))

if __name__ == '__main__':
    main()
