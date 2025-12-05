#!/bin/bash

# Demo Script: Show SDK Impact
# This script demonstrates the difference between original and SDK-powered server

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       X402 SERVER - SDK INTEGRATION DEMO                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📊 Comparing Original vs SDK-Powered Server:"
echo ""

# Count lines
original_lines=$(wc -l < server.js)
sdk_lines=$(wc -l < server-sdk.js)
reduction=$((original_lines - sdk_lines))
percent=$(awk "BEGIN {printf \"%.1f\", ($reduction/$original_lines)*100}")

echo "Lines of Code:"
echo "  Original:     $original_lines lines"
echo "  SDK-Powered:  $sdk_lines lines"
echo "  Reduction:    $reduction lines ($percent%)"
echo ""

echo "Dependencies:"
echo "  Original:     ethers.js + ABI files (manual loading)"
echo "  SDK-Powered:  ethers.js + warp402-sdk (no ABIs needed)"
echo ""

echo "Setup Complexity:"
echo "  Original:     ~15 lines (provider, wallet, ABI, contracts)"
echo "  SDK-Powered:  ~3 lines (just SDK initialization)"
echo ""

echo "Method Calls:"
echo "  Original:     contract.hasPaid() + manual encoding"
echo "  SDK-Powered:  warp.verify() - simple!"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo ""

echo "🚀 Want to see it in action?"
echo ""
echo "Run the SDK-powered server:"
echo "  npm run start:sdk"
echo ""
echo "Or compare files:"
echo "  diff server.js server-sdk.js"
echo ""
echo "Read full comparison:"
echo "  cat SDK_DEMO.md"
echo ""
