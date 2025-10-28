#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🚀 k3d + Tilt Local Development Setup                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📋 Checking for existing k3d cluster...${NC}"
if k3d cluster list | grep -q "roussev-local"; then
    echo -e "${YELLOW}⚠️  Cluster 'roussev-local' already exists${NC}"
    read -p "Do you want to delete and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🗑️  Deleting existing cluster...${NC}"
        k3d cluster delete roussev-local
    else
        echo -e "${GREEN}✅ Using existing cluster${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}🏗️  Creating k3d cluster...${NC}"
k3d cluster create --config k3d-config.yaml

echo -e "${BLUE}⏳ Waiting for cluster to be ready...${NC}"
kubectl wait --for=condition=Ready nodes --all --timeout=60s

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ k3d Cluster Created Successfully!                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Cluster Info:${NC}"
kubectl cluster-info
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo -e "  1. Start Tilt: ${GREEN}tilt up${NC}"
echo -e "  2. Open Tilt UI in browser (press space in Tilt)"
echo -e "  3. Access services:"
echo -e "     - PostgreSQL:    ${GREEN}localhost:5432${NC}"
echo -e "     - Items Service: ${GREEN}http://localhost:8081${NC}"
echo -e "     - Website App:   ${GREEN}http://localhost:8082${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Run 'tilt down' to stop all services${NC}"
echo ""

