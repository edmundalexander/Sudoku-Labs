#!/bin/bash
echo "=== Final Resource Loading Test ==="
echo ""

echo "Testing from public/index.html perspective:"
BASE="http://localhost:8080/public"

# When index.html is at public/index.html, ../ goes to root
echo "1. ../config/config.local.js"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8080/config/config.local.js

echo "2. ../src/constants.js"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8080/src/constants.js

echo "3. ../src/utils.js"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8080/src/utils.js

echo "4. ../src/sound.js"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8080/src/sound.js

echo "5. ../src/services.js"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8080/src/services.js

echo "6. ../src/app.jsx"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:8080/src/app.jsx

echo ""
echo "✅ All resources should return 200"
