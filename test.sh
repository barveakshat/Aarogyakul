#!/bin/bash
source .env
mvn spring-boot:run > app.log 2>&1 &
APP_PID=$!
sleep 15
curl -s -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"email":"test2@example.com","password":"password","fullName":"Test"}' > login.json
TOKEN=$(cat login.json | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "TOKEN=$TOKEN"
curl -s -v -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/documents/00000000-0000-0000-0000-000000000000/status
kill $APP_PID
