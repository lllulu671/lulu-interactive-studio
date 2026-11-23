#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Lulu Interactive Studio at http://127.0.0.1:8080/web/index.html ..."
open "http://127.0.0.1:8080/web/index.html"
python3 -m http.server 8080 --bind 127.0.0.1
