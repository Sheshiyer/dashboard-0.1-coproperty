#!/bin/bash

# Test script for BKK Property Cache System
# Tests sync, metadata, and property endpoints

API_KEY="VzfvRjmsHYetC8SZwpI69iPmFP4MCvtJjhZAK+ABIsg="
BASE_URL="http://localhost:8787/api/properties"

echo "🧪 Testing BKK Property Cache System"
echo "====================================="
echo ""

echo "1️⃣ Testing Manual Sync Endpoint"
echo "POST /api/properties/sync"
echo "---"
SYNC_RESULT=$(curl -s -X POST "$BASE_URL/sync" -H "Authorization: Bearer $API_KEY")
echo "$SYNC_RESULT" | jq .
echo ""

echo "2️⃣ Testing Metadata Endpoint"
echo "GET /api/properties/metadata"
echo "---"
METADATA=$(curl -s "$BASE_URL/metadata" -H "Authorization: Bearer $API_KEY")
echo "$METADATA" | jq .
echo ""

echo "3️⃣ Testing Properties Endpoint (Cached)"
echo "GET /api/properties"
echo "---"
START_TIME=$(date +%s%3N)
PROPERTIES=$(curl -s "$BASE_URL" -H "Authorization: Bearer $API_KEY")
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

PROPERTY_COUNT=$(echo "$PROPERTIES" | jq '.count')
echo "✅ Retrieved $PROPERTY_COUNT properties in ${RESPONSE_TIME}ms"
echo ""

echo "4️⃣ Validating Filter Logic"
echo "Checking property number range..."
NUMBERS=$(echo "$PROPERTIES" | jq -r '.data[] | .name' | grep -o '^[0-9]\+' | sort -n | uniq)
MIN_NUM=$(echo "$NUMBERS" | head -1)
MAX_NUM=$(echo "$NUMBERS" | tail -1)

echo "📊 Property Number Range: $MIN_NUM - $MAX_NUM"

# Check all contain BKK
NON_BKK=$(echo "$PROPERTIES" | jq -r '.data[] | select(.name | test("BKK"; "i") | not) | .name')
if [ -z "$NON_BKK" ]; then
    echo "✅ All properties contain 'BKK'"
else
    echo "❌ Found non-BKK properties:"
    echo "$NON_BKK"
fi

echo ""
echo "5️⃣ Sample Properties"
echo "---"
echo "$PROPERTIES" | jq -r '.data[0:3] | .[] | "\(.name)"'
echo ""

echo "✅ All tests complete!"
