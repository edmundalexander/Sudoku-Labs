#!/bin/bash
echo "=== Resource Loading Check ==="
echo ""

# Test main page
echo "1. Testing index.html..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080/public/index.html

# Test config files
echo "2. Testing config files..."
curl -s -o /dev/null -w "config.local.js: %{http_code}\n" http://localhost:8080/config/config.local.js
curl -s -o /dev/null -w "config.production.example.js: %{http_code}\n" http://localhost:8080/config/config.production.example.js

# Test source files
echo "3. Testing source files..."
for file in constants.js utils.js sound.js services.js app.jsx; do
  curl -s -o /dev/null -w "$file: %{http_code}\n" http://localhost:8080/src/$file
done

# Test external CDN resources
echo "4. Testing external CDN resources..."
curl -s -o /dev/null -w "React: %{http_code}\n" https://unpkg.com/react@18/umd/react.production.min.js
curl -s -o /dev/null -w "ReactDOM: %{http_code}\n" https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
curl -s -o /dev/null -w "Babel: %{http_code}\n" https://unpkg.com/@babel/standalone/babel.min.js

echo ""
echo "=== JavaScript Syntax Check ==="
for file in src/*.js src/*.jsx; do
  echo "Checking $file..."
  node -c "$file" 2>&1 || echo "ERROR in $file"
done

