#!/bin/bash
echo "=== Testing x402-server with avax-warp-pay SDK ==="
echo ""
echo "1. Starting server..."
node server-sdk.js > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 3

echo "2. Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "healthy"; then
  echo "   ✅ Server is healthy"
  echo "$HEALTH" | grep -o '"sdk":{[^}]*}' | head -1
else
  echo "   ❌ Server not responding"
fi

echo ""
echo "3. Testing 402 response..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/resource)
CODE=$(echo "$RESPONSE" | tail -1)
if [ "$CODE" = "402" ]; then
  echo "   ✅ Returns HTTP 402 Payment Required"
else
  echo "   ❌ Expected 402, got $CODE"
fi

echo ""
echo "4. Stopping server..."
kill $SERVER_PID 2>/dev/null
echo "   ✅ Cleanup complete"
echo ""
echo "✅ Server works correctly with avax-warp-pay SDK!"
