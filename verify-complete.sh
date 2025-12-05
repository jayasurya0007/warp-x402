#!/bin/bash

# Warp-402 Complete Verification Script
# Verifies SDK installation, PRESETS functionality, and documentation

echo "🚀 Warp-402 Complete Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Check NPM package availability
echo "📦 Step 1: Verifying NPM package..."
if npm view avax-warp-pay version &>/dev/null; then
    VERSION=$(npm view avax-warp-pay version)
    echo -e "${GREEN}✅ avax-warp-pay@${VERSION} is published on NPM${NC}"
else
    echo -e "${RED}❌ Package not found on NPM${NC}"
    ((ERRORS++))
fi
echo ""

# 2. Verify SDK can be installed
echo "📥 Step 2: Testing SDK installation..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
if npm init -y &>/dev/null && npm install avax-warp-pay &>/dev/null; then
    echo -e "${GREEN}✅ SDK installs successfully${NC}"
else
    echo -e "${RED}❌ SDK installation failed${NC}"
    ((ERRORS++))
fi
cd - > /dev/null
rm -rf "$TEMP_DIR"
echo ""

# 3. Check SDK exports PRESETS
echo "🔍 Step 3: Verifying PRESETS export..."
cd /home/madtitan/wrap-x402/wrap402-sdk
if grep -q "export.*PRESETS" dist/index.d.ts 2>/dev/null; then
    echo -e "${GREEN}✅ PRESETS is exported from SDK${NC}"
else
    echo -e "${RED}❌ PRESETS not found in exports${NC}"
    ((ERRORS++))
fi
echo ""

# 4. Verify presets.ts exists
echo "📝 Step 4: Checking PRESETS configuration file..."
if [ -f "src/utils/presets.ts" ]; then
    echo -e "${GREEN}✅ presets.ts exists${NC}"
    
    # Check for required presets
    if grep -q "export const LOCAL_PRESET" src/utils/presets.ts && \
       grep -q "export const FUJI_PRESET" src/utils/presets.ts; then
        echo -e "${GREEN}✅ Both LOCAL and FUJI presets defined${NC}"
    else
        echo -e "${RED}❌ Missing preset definitions${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}❌ presets.ts not found${NC}"
    ((ERRORS++))
fi
echo ""

# 5. Verify deployed contract addresses
echo "🔗 Step 5: Verifying deployed contract addresses..."
EXPECTED_ADDRESS="0x52C84043CD9c865236f11d9Fc9F56aa003c1f922"

if grep -q "$EXPECTED_ADDRESS" src/utils/presets.ts; then
    echo -e "${GREEN}✅ Deployed contract addresses present${NC}"
else
    echo -e "${RED}❌ Contract addresses not found${NC}"
    ((ERRORS++))
fi
echo ""

# 6. Check documentation files
echo "📚 Step 6: Verifying documentation..."
DOCS_OK=true

# Check SDK README
if [ -f "README.md" ]; then
    if grep -q "Pre-Deployed Contracts" README.md && \
       grep -q "WarpSender.sol" README.md && \
       grep -q "PRESETS" README.md; then
        echo -e "${GREEN}✅ SDK README.md complete with contracts and presets${NC}"
    else
        echo -e "${YELLOW}⚠️  SDK README missing some sections${NC}"
        DOCS_OK=false
    fi
else
    echo -e "${RED}❌ SDK README.md not found${NC}"
    DOCS_OK=false
fi

# Check project README
if [ -f "../wrapx402/README.md" ]; then
    if grep -q "Zero Deployment Required" ../wrapx402/README.md && \
       grep -q "PRESETS.fuji" ../wrapx402/README.md; then
        echo -e "${GREEN}✅ Project README.md highlights zero-deployment${NC}"
    else
        echo -e "${YELLOW}⚠️  Project README could be improved${NC}"
        DOCS_OK=false
    fi
else
    echo -e "${RED}❌ Project README.md not found${NC}"
    DOCS_OK=false
fi

if ! $DOCS_OK; then
    ((ERRORS++))
fi
echo ""

# 7. Test PRESETS functionality
echo "🧪 Step 7: Testing PRESETS functionality..."
if npx ts-node test/test-presets.ts 2>/dev/null | grep -q "All tests passed"; then
    echo -e "${GREEN}✅ PRESETS tests pass${NC}"
else
    echo -e "${RED}❌ PRESETS tests failed${NC}"
    ((ERRORS++))
fi
echo ""

# 8. Verify package version
echo "📌 Step 8: Checking package version..."
LOCAL_VERSION=$(node -p "require('./package.json').version")
if [ "$LOCAL_VERSION" == "1.0.3" ]; then
    echo -e "${GREEN}✅ Package version is 1.0.3${NC}"
else
    echo -e "${YELLOW}⚠️  Package version is ${LOCAL_VERSION} (expected 1.0.3)${NC}"
fi
echo ""

# 9. Check build artifacts
echo "🔨 Step 9: Verifying build artifacts..."
if [ -d "dist" ] && [ -f "dist/index.js" ] && [ -f "dist/utils/presets.js" ]; then
    echo -e "${GREEN}✅ Build artifacts present${NC}"
else
    echo -e "${RED}❌ Build incomplete or missing files${NC}"
    ((ERRORS++))
fi
echo ""

# 10. Verify backend integration
echo "🔌 Step 10: Checking backend integration..."
if grep -q "avax-warp-pay" ../x402-server/package.json 2>/dev/null; then
    echo -e "${GREEN}✅ Backend uses published SDK${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may not use published package${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Verification Summary"
echo "=================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All verifications passed!${NC}"
    echo ""
    echo "🎉 Your Warp-402 project is ready for hackathon submission!"
    echo ""
    echo "Quick Start for Judges:"
    echo "  npm install avax-warp-pay"
    echo "  import { Warp402, PRESETS } from 'avax-warp-pay';"
    echo "  const warp = new Warp402({ ...PRESETS.fuji, privateKey });"
    echo ""
    echo "Documentation:"
    echo "  - NPM: https://www.npmjs.com/package/avax-warp-pay"
    echo "  - SDK README: wrap402-sdk/README.md"
    echo "  - Project README: wrapx402/README.md"
    exit 0
else
    echo -e "${RED}❌ Found ${ERRORS} issue(s)${NC}"
    echo ""
    echo "Please review the errors above and fix them."
    exit 1
fi
