#!/bin/bash
# UniMatch — local web server launcher
# Double-click this file (macOS) to serve the site at http://localhost:8000
# The Explore / OLAP (DuckDB-WASM) feature needs to be served over http,
# not opened directly as a file. Everything else also works by simply
# double-clicking index.html.
cd "$(dirname "$0")" || exit 1
PORT=8000
echo "──────────────────────────────────────────────"
echo "  UniMatch is starting at http://localhost:$PORT"
echo "  Press Ctrl+C in this window to stop the server."
echo "──────────────────────────────────────────────"
# open the browser shortly after the server boots
( sleep 1; (command -v open >/dev/null && open "http://localhost:$PORT") || \
            (command -v xdg-open >/dev/null && xdg-open "http://localhost:$PORT") ) &
# Python 3 ships with macOS / most Linux; serves the current folder
python3 -m http.server "$PORT"
