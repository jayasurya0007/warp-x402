#!/bin/bash

# Fuji C-Chain Only Deployment Script
# Both WarpSender and WarpReceiver deployed to Fuji C-Chain (simulates cross-chain)

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Fuji C-Chain Deployment - wrap-x402 Payment System     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.fuji exists
if [ ! -f .env.fuji ]; then
    echo -e "${RED}✗ .env.fuji not found!${NC}"
    exit 1
fi

# Load environment
export $(cat .env.fuji | xargs)

echo -e "${BLUE}Step 1: Environment Configuration${NC}"
echo "  Network: Fuji C-Chain (both contracts)"
echo "  RPC: $FUJI_C_CHAIN_RPC"
echo "  Chain ID: $FUJI_C_CHAIN_ID"
echo "  Teleporter: $FUJI_C_TELEPORTER"
echo ""

# Check balance
echo -e "${BLUE}Step 2: Checking wallet balance...${NC}"
DEPLOYER_ADDRESS=$(cast wallet address $PRIVATE_KEY 2>/dev/null || echo "Unable to derive address")
echo "  Deployer: $DEPLOYER_ADDRESS"

if [ "$DEPLOYER_ADDRESS" != "Unable to derive address" ]; then
    BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $FUJI_C_CHAIN_RPC)
    BALANCE_AVAX=$(echo "scale=4; $BALANCE / 1000000000000000000" | bc)
    echo "  Balance: ${BALANCE_AVAX} AVAX"
    
    if [ "$BALANCE" -lt "1000000000000000000" ]; then
        echo -e "${YELLOW}⚠ Low balance! Get testnet AVAX from https://faucet.avax.network/${NC}"
        echo ""
    fi
fi
echo ""

# Build contracts
echo -e "${BLUE}Step 3: Building contracts...${NC}"
forge build
echo -e "${GREEN}✓ Contracts built${NC}"
echo ""

# Deploy WarpReceiver
echo -e "${BLUE}Step 4: Deploying WarpReceiver to Fuji C-Chain...${NC}"

RECEIVER_OUTPUT=$(forge script script/fuji/DeployWarpReceiverFuji.s.sol:DeployWarpReceiverFuji \
  --rpc-url $FUJI_C_CHAIN_RPC \
  --broadcast \
  --legacy 2>&1)

echo "$RECEIVER_OUTPUT"

RECEIVER_ADDRESS=$(echo "$RECEIVER_OUTPUT" | grep "WarpReceiver deployed at:" | awk '{print $4}')

if [ -z "$RECEIVER_ADDRESS" ]; then
    echo -e "${RED}✗ Failed to deploy WarpReceiver${NC}"
    exit 1
fi

echo -e "${GREEN}✓ WarpReceiver deployed: $RECEIVER_ADDRESS${NC}"
echo ""

# Deploy WarpSender
echo -e "${BLUE}Step 5: Deploying WarpSender to Fuji C-Chain...${NC}"

SENDER_OUTPUT=$(forge script script/fuji/DeployWarpSenderFuji.s.sol:DeployWarpSenderFuji \
  --rpc-url $FUJI_C_CHAIN_RPC \
  --broadcast \
  --legacy 2>&1)

echo "$SENDER_OUTPUT"

SENDER_ADDRESS=$(echo "$SENDER_OUTPUT" | grep "WarpSender deployed at:" | awk '{print $4}')

if [ -z "$SENDER_ADDRESS" ]; then
    echo -e "${RED}✗ Failed to deploy WarpSender${NC}"
    exit 1
fi

echo -e "${GREEN}✓ WarpSender deployed: $SENDER_ADDRESS${NC}"
echo ""

# Configure Sender
echo -e "${BLUE}Step 6: Configuring WarpSender...${NC}"
echo "  Linking Sender → Receiver (same chain)"

export SENDER_ADDRESS=$SENDER_ADDRESS
export RECEIVER_ADDRESS=$RECEIVER_ADDRESS

CONFIG_OUTPUT=$(forge script script/fuji/ConfigureSenderFuji.s.sol:ConfigureSenderFuji \
  --rpc-url $FUJI_C_CHAIN_RPC \
  --broadcast \
  --legacy 2>&1)

echo "$CONFIG_OUTPUT"

echo -e "${GREEN}✓ WarpSender configured${NC}"
echo ""

# Summary
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              Deployment Complete!                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Deployed Contracts (both on Fuji C-Chain):${NC}"
echo "  WarpSender:   $SENDER_ADDRESS"
echo "  WarpReceiver: $RECEIVER_ADDRESS"
echo ""
echo -e "${BLUE}Testnet Explorer:${NC}"
echo "  Sender:   https://testnet.snowtrace.io/address/$SENDER_ADDRESS"
echo "  Receiver: https://testnet.snowtrace.io/address/$RECEIVER_ADDRESS"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Test payment: forge script script/fuji/SendPaymentFuji.s.sol --rpc-url $FUJI_C_CHAIN_RPC --broadcast --legacy"
echo "  2. Update server config with deployed addresses"
echo "  3. Run end-to-end demo"
echo ""

# Save deployment info
cat > fuji-deployment.txt << EOF
# Fuji C-Chain Deployment
Date: $(date)

# Contract Addresses (both on Fuji C-Chain)
SENDER_ADDRESS=$SENDER_ADDRESS
RECEIVER_ADDRESS=$RECEIVER_ADDRESS

# Network Configuration
FUJI_C_CHAIN_RPC=$FUJI_C_CHAIN_RPC
FUJI_C_CHAIN_ID=$FUJI_C_CHAIN_ID
FUJI_C_TELEPORTER=$FUJI_C_TELEPORTER

# Deployer
DEPLOYER_ADDRESS=$DEPLOYER_ADDRESS
EOF

echo -e "${GREEN}Deployment info saved to fuji-deployment.txt${NC}"
echo ""
echo "Happy hacking! 🚀"
