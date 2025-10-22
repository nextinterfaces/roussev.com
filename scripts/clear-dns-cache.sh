#!/bin/bash

echo "Clearing DNS cache on macOS..."
echo ""

# Flush DNS cache (works on macOS)
sudo dscacheutil -flushcache

# Restart mDNSResponder
sudo killall -HUP mDNSResponder

# Also try discoverd (older macOS versions)
sudo killall -HUP discoverd 2>/dev/null || true

echo ""
echo "DNS cache cleared!"
echo ""
echo "Testing DNS resolution..."
echo ""

# Wait a moment
sleep 2

# Test DNS
echo "Google DNS (8.8.8.8): $(dig @8.8.8.8 roussev.com A +short)"
echo "Cloudflare DNS (1.1.1.1): $(dig @1.1.1.1 roussev.com A +short)"
echo "Your Local DNS: $(dig roussev.com A +short)"
echo ""

# Check if it matches
LOCAL_IP=$(dig roussev.com A +short | head -1)
EXPECTED_IP="178.156.207.109"

if [ "$LOCAL_IP" = "$EXPECTED_IP" ]; then
    echo "SUCCESS! Your local DNS now resolves to the correct IP: $LOCAL_IP"
    echo ""
    echo "You can now test in browser: https://roussev.com/api"
else
    echo "WARNING: Still cached: $LOCAL_IP (expected: $EXPECTED_IP)"
    echo ""
    echo "Try these additional steps:"
    echo "1. Restart your browser"
    echo "2. Disconnect/reconnect WiFi"
    echo "3. Wait 5-10 minutes for cache to expire naturally"
    echo "4. Or use: curl https://roussev.com/api --resolve roussev.com:443:178.156.207.109"
fi

