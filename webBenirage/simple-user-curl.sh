#!/bin/bash
# Simple one-line curl command to create users

curl -X POST http://localhost:3001/create-admin-user \
  -H "Content-Type: application/json" \
  -H "x-api-key: benirage-admin-2024"