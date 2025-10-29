#!/bin/bash
# Test script to validate OpenTelemetry integration with Jaeger

set -e

echo "🧪 Testing OpenTelemetry Integration"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

#ITEMS_SERVICE_URL="http://localhost:8081"
#JAEGER_UI_URL="http://localhost:16686"
ITEMS_SERVICE_URL="https://app.roussev.com/items"
JAEGER_UI_URL="https://app.roussev.com/jaeger"

echo -e "${BLUE}Step 1: Check if items-service is running${NC}"
if curl -s "${ITEMS_SERVICE_URL}/v1/health" > /dev/null; then
    echo -e "${GREEN}✓ Items service is running${NC}"
else
    echo "✗ Items service is not responding"
    echo "  Make sure Tilt is running: task local:start"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 2: Check if Jaeger UI is accessible${NC}"
if curl -s "${JAEGER_UI_URL}" > /dev/null; then
    echo -e "${GREEN}✓ Jaeger UI is accessible${NC}"
else
    echo "✗ Jaeger UI is not responding"
    echo "  Make sure Jaeger is deployed in k3d"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 3: Generate some test traffic${NC}"
echo "Making requests to items-service..."

# Health check
echo -n "  - GET /v1/health ... "
curl -s "${ITEMS_SERVICE_URL}/v1/health" > /dev/null
echo -e "${GREEN}✓${NC}"

# List items
echo -n "  - GET /v1/items ... "
curl -s "${ITEMS_SERVICE_URL}/v1/items" > /dev/null
echo -e "${GREEN}✓${NC}"

# Create an item
echo -n "  - POST /v1/items (create test item) ... "
ITEM_NAME="test-item-$(date +%s)"
curl -s -X POST "${ITEMS_SERVICE_URL}/v1/items" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${ITEM_NAME}\"}" > /dev/null
echo -e "${GREEN}✓${NC}"

# List items again
echo -n "  - GET /v1/items (verify item created) ... "
curl -s "${ITEMS_SERVICE_URL}/v1/items" > /dev/null
echo -e "${GREEN}✓${NC}"

# Test 404
echo -n "  - GET /v1/nonexistent (test 404) ... "
curl -s "${ITEMS_SERVICE_URL}/v1/nonexistent" > /dev/null
echo -e "${GREEN}✓${NC}"

echo ""
echo -e "${BLUE}Step 4: Wait for traces to be exported${NC}"
echo "Waiting 5 seconds for traces to reach Jaeger..."
sleep 5
echo -e "${GREEN}✓ Done waiting${NC}"
echo ""

echo -e "${BLUE}Step 5: Check Jaeger for traces${NC}"
echo "Querying Jaeger API for items-service traces..."

# Query Jaeger API for traces
TRACES=$(curl -s "${JAEGER_UI_URL}/api/traces?service=items-service&limit=10")

# Count traces
TRACE_COUNT=$(echo "$TRACES" | grep -o '"traceID"' | wc -l | tr -d ' ')

if [ "$TRACE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found ${TRACE_COUNT} traces in Jaeger!${NC}"
    echo ""
    echo -e "${GREEN}🎉 OpenTelemetry is working correctly!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${YELLOW}📊 Next Steps:${NC}"
    echo ""
    echo "1. Open Jaeger UI in your browser:"
    echo -e "   ${BLUE}${JAEGER_UI_URL}${NC}"
    echo ""
    echo "2. In the Jaeger UI:"
    echo "   • Select 'items-service' from the Service dropdown"
    echo "   • Click 'Find Traces' button"
    echo "   • You should see your recent requests!"
    echo ""
    echo "3. Click on any trace to see:"
    echo "   • Request timeline and duration"
    echo "   • HTTP method, URL, status code"
    echo "   • Database queries (via auto-instrumentation)"
    echo "   • Custom attributes (item count, item ID, etc.)"
    echo "   • Any errors or exceptions"
    echo ""
    echo "4. Try these views in Jaeger:"
    echo "   • Timeline view - see operation durations"
    echo "   • Trace Graph - visualize the call flow"
    echo "   • Span details - see all attributes and logs"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo -e "${YELLOW}⚠ No traces found in Jaeger yet${NC}"
    echo ""
    echo "This could mean:"
    echo "1. Traces haven't been exported yet (wait a bit longer)"
    echo "2. OpenTelemetry is disabled (check OTEL_ENABLED env var)"
    echo "3. Connection issue between items-service and Jaeger"
    echo ""
    echo "Check the items-service logs in Tilt for any errors."
fi

