# Start tail in background
wrangler pages deployment tail 43c230fb-950e-4389-9e84-e4cbe77cafd7 --project-name=cyber-bazi > tail.log 2>&1 &
TAIL_PID=$!

# Wait for tail to start
sleep 10

# Trigger the API
curl -sS -X POST https://main.cyber-bazi.pages.dev/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"name":"Debug","gender":"male","date":"1990-01-01","time":"12:00","location":"Debug","email":"debug@t.com","language":"zh"}'

# Wait for logs to arrive
sleep 10

# Kill tail and show logs
kill $TAIL_PID
cat tail.log
