#!/usr/bin/env python3
"""
Simple HTTP server for CodeRunner development
Run this to serve the game locally and avoid CORS/file loading issues
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

def main():
    print("🎮 Starting CodeRunner Development Server...")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🌐 Server running at: http://localhost:{PORT}")
    print("🚀 Opening game in browser...")
    print("⏹️  Press Ctrl+C to stop the server")
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}')
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use. Try a different port or close other servers.")
            print(f"🌐 You can also try opening: http://localhost:{PORT}")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
