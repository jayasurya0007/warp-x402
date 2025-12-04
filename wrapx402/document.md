# Avalanche Cross-Subnet Messaging: Complete Guide

This document provides a comprehensive step-by-step guide to creating Avalanche subnets and deploying cross-chain messaging contracts using Teleporter (ICM).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Subnet Creation](#subnet-creation)
3. [Network Setup](#network-setup)
4. [Contract Development](#contract-development)
5. [Deployment](#deployment)
6. [Testing & Verification](#testing--verification)
7. [Architecture & Technical Details](#architecture--technical-details)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install Avalanche CLI
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s

# Verify installations
forge --version
cast --version
avalanche --version
```

### Environment Setup

```bash
# Standard Avalanche local network private key
export PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027

# Pre-deployed Teleporter Messenger address (standard on local networks)
export TELEPORTER_MESSENGER=0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf
```

---

## Subnet Creation

### Step 1: Create Subnet A

```bash
avalanche subnet create subnetA
```

**Configuration Options:**
- Choose: **SubnetEVM**
- Chain ID: `1001` (or custom)
- Token Symbol: Custom (e.g., `SUBA`)
- Subnet-EVM Version: Latest
- Gas Configuration: Low disk use (dev mode)
- Advanced Features: Enable Teleporter/ICM

### Step 2: Create Subnet B

```bash
avalanche subnet create subnetB
```

**Configuration Options:**
- Choose: **SubnetEVM**
- Chain ID: `1002` (or custom)
- Token Symbol: Custom (e.g., `SUBB`)
- Same settings as Subnet A

### Step 3: Deploy Subnets Locally

```bash
# Start local network with both subnets
avalanche subnet deploy subnetA --local
avalanche subnet deploy subnetB --local
```

**Important Outputs to Note:**
- Subnet A RPC: `http://127.0.0.1:9650/ext/bc/{blockchainID}/rpc`
- Subnet B RPC: `http://127.0.0.1:9652/ext/bc/{blockchainID}/rpc`
- Funded test account address
- Private keys for testing

### Step 4: Verify Network Status

```bash
# Check network health
avalanche network status
```

**Expected Output:**
```
Network is Up:
  Number of Nodes: 2
  Number of Blockchains: 2
  Network Healthy: true
  Blockchains Healthy: true
```

### Step 5: Get Blockchain IDs

```bash
# Query P-Chain for blockchain list
curl -X POST --data '{
    "jsonrpc":"2.0",
    "id": 1,
    "method":"platform.getBlockchains",
    "params": {}
}' -H 'content-type:application/json;' http://127.0.0.1:9650/ext/bc/P
```

**Extract:**
- Subnet A Blockchain ID (CB58 format)
- Subnet B Blockchain ID (CB58 format)

```bash
# Verify chain IDs
cast chain-id --rpc-url http://127.0.0.1:9650/ext/bc/{subnetA_blockchain_id}/rpc
cast chain-id --rpc-url http://127.0.0.1:9650/ext/bc/{subnetB_blockchain_id}/rpc
```

---

## Network Setup

### Understanding the Local Network

The local Avalanche network includes:
- **2 Validator Nodes**: NodeID-7Xhw... (port 9650) and NodeID-MFrZ... (port 9652)
- **Teleporter Messenger**: Pre-deployed at `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`
- **Warp Precompile**: Available at `0x0200000000000000000000000000000000000005`
- **ICM Relayer**: Automatically running to relay messages between subnets

### Verify Teleporter Deployment

```bash
# Check if Teleporter Messenger has code on Subnet A
cast code 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf \
  --rpc-url http://127.0.0.1:9650/ext/bc/{subnetA_blockchain_id}/rpc
```

Should return bytecode (not `0x`).

---

## Contract Development

### Project Structure

```bash
# Initialize Foundry project
forge init wrap-x402
cd wrap-x402

# Install dependencies
forge install foundry-rs/forge-std
```

### Contract: TeleporterInterfaces.sol

Create `src/TeleporterInterfaces.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface ITeleporterMessenger {
    struct TeleporterFeeInfo {
        address feeTokenAddress;
        uint256 amount;
    }

    struct TeleporterMessageInput {
        bytes32 destinationBlockchainID;
        address destinationAddress;
        TeleporterFeeInfo feeInfo;
        uint256 requiredGasLimit;
        address[] allowedRelayerAddresses;
        bytes message;
    }

    function sendCrossChainMessage(
        TeleporterMessageInput calldata input
    ) external payable returns (bytes32);
}

interface ITeleporterReceiver {
    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external;
}
```

**Key Points:**
- Uses nested `TeleporterFeeInfo` struct (matches deployed Teleporter version)
- `sendCrossChainMessage` is payable
- `receiveTeleporterMessage` is the callback interface

### Contract: WarpSender.sol

Create `src/WarpSender.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger} from "./TeleporterInterfaces.sol";

contract WarpSender {
    ITeleporterMessenger public immutable MESSENGER;
    
    bytes32 public remoteBlockchainId;
    address public remoteReceiver;

    constructor(address _messenger) {
        MESSENGER = ITeleporterMessenger(_messenger);
    }

    function setRemoteReceiver(bytes32 _remoteBlockchainId, address _remoteReceiver) external {
        remoteBlockchainId = _remoteBlockchainId;
        remoteReceiver = _remoteReceiver;
    }

    function sendMessage(string calldata message) external payable {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");

        ITeleporterMessenger.TeleporterMessageInput memory input = ITeleporterMessenger.TeleporterMessageInput({
            destinationBlockchainID: remoteBlockchainId,
            destinationAddress: remoteReceiver,
            feeInfo: ITeleporterMessenger.TeleporterFeeInfo({
                feeTokenAddress: address(0),
                amount: 0
            }),
            requiredGasLimit: 100000,
            allowedRelayerAddresses: new address[](0),
            message: abi.encode(message)
        });

        MESSENGER.sendCrossChainMessage(input);
    }
}
```

### Contract: WarpReceiver.sol

Create `src/WarpReceiver.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ITeleporterMessenger, ITeleporterReceiver} from "./TeleporterInterfaces.sol";

contract WarpReceiver is ITeleporterReceiver {
    address public immutable MESSENGER;
    
    string public lastMessage;
    address public lastSender;

    constructor(address _messenger) {
        MESSENGER = _messenger;
    }

    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        // Security: Uncomment in production
        // require(msg.sender == MESSENGER, "Only Teleporter");
        
        lastMessage = abi.decode(message, (string));
        lastSender = originSenderAddress;
    }
}
```

**Note:** Authentication is commented out for testing. Enable in production.

### Build Contracts

```bash
forge build
```

---

## Deployment

### Step 1: Get Blockchain ID in Hex Format

The Teleporter requires blockchain IDs in hex format (bytes32), not CB58.

**Create CB58 decoder** (`decode_cb58.py`):

```python
import sys

ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

def b58decode(s):
    n = 0
    for c in s:
        n = n * 58 + ALPHABET.index(c)
    h = hex(n)[2:]
    if len(h) % 2:
        h = '0' + h
    b = bytes.fromhex(h)
    pad = 0
    for c in s:
        if c == ALPHABET[0]:
            pad += 1
        else:
            break
    return b'\x00' * pad + b

def decode_cb58(s):
    decoded = b58decode(s)
    payload = decoded[:-4]  # Remove checksum
    return payload.hex()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print("0x" + decode_cb58(sys.argv[1]))
```

**Convert Subnet B Blockchain ID:**

```bash
# Example: 2MBFLxCkhVCLXvVeLvzqXrzjAVRQuKj6Aygq49a3dcsKs6AX3k
python3 decode_cb58.py 2MBFLxCkhVCLXvVeLvzqXrzjAVRQuKj6Aygq49a3dcsKs6AX3k

# Output: 0xb1827c625b4b61ae5cd9efb6b8acf274302add82948e78f6dc160b865149a8d0
export SUBNET_B_BLOCKCHAIN_ID=0xb1827c625b4b61ae5cd9efb6b8acf274302add82948e78f6dc160b865149a8d0
```

### Step 2: Deploy WarpReceiver (Subnet B)

Create `script/DeployWarpReceiver.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WarpReceiver} from "src/WarpReceiver.sol";
import {Script, console} from "forge-std/Script.sol";

contract DeployWarpReceiver is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address messenger = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;
        WarpReceiver receiver = new WarpReceiver(messenger);

        console.log("WarpReceiver deployed at:", address(receiver));

        vm.stopBroadcast();
    }
}
```

**Deploy:**

```bash
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
forge script script/DeployWarpReceiver.s.sol:DeployWarpReceiver \
  --rpc-url http://127.0.0.1:9650/ext/bc/2MBFLxCkhVCLXvVeLvzqXrzjAVRQuKj6Aygq49a3dcsKs6AX3k/rpc \
  --broadcast
```

**Output Example:**
```
WarpReceiver deployed at: 0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00
```

```bash
export RECEIVER_ADDRESS=0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00
```

### Step 3: Deploy WarpSender (Subnet A)

Create `script/DeployWarpSender.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract DeployWarpSender is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address messenger = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;
        WarpSender sender = new WarpSender(messenger);

        console.log("WarpSender deployed at:", address(sender));

        vm.stopBroadcast();
    }
}
```

**Deploy:**

```bash
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
forge script script/DeployWarpSender.s.sol:DeployWarpSender \
  --rpc-url http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc \
  --broadcast
```

**Output Example:**
```
WarpSender deployed at: 0x7B4982e1F7ee384F206417Fb851a1EB143c513F9
```

```bash
export SENDER_ADDRESS=0x7B4982e1F7ee384F206417Fb851a1EB143c513F9
```

### Step 4: Configure WarpSender

Create `script/ConfigureSender.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract ConfigureSender is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address senderAddress = vm.envOr("SENDER_ADDRESS", address(0));
        require(senderAddress != address(0), "SENDER_ADDRESS env var not set");
        
        WarpSender sender = WarpSender(senderAddress);

        address receiverAddress = vm.envOr("RECEIVER_ADDRESS", address(0));
        require(receiverAddress != address(0), "RECEIVER_ADDRESS env var not set");

        bytes32 remoteBlockchainId = vm.envBytes32("REMOTE_BLOCKCHAIN_ID");

        sender.setRemoteReceiver(remoteBlockchainId, receiverAddress);

        vm.stopBroadcast();
    }
}
```

**Configure:**

```bash
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
SENDER_ADDRESS=0x7B4982e1F7ee384F206417Fb851a1EB143c513F9 \
RECEIVER_ADDRESS=0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00 \
REMOTE_BLOCKCHAIN_ID=0xb1827c625b4b61ae5cd9efb6b8acf274302add82948e78f6dc160b865149a8d0 \
forge script script/ConfigureSender.s.sol:ConfigureSender \
  --rpc-url http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc \
  --broadcast
```

---

## Testing & Verification

### Step 1: Send Cross-Chain Message

Create `script/SendWarpMessage.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract SendWarpMessage is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address senderAddress = vm.envOr("SENDER_ADDRESS", address(0));
        require(senderAddress != address(0), "SENDER_ADDRESS env var not set");

        WarpSender sender = WarpSender(senderAddress);
        sender.sendMessage("Hello from subnetA!");

        vm.stopBroadcast();
    }
}
```

**Send Message:**

```bash
PRIVATE_KEY=0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
SENDER_ADDRESS=0x7B4982e1F7ee384F206417Fb851a1EB143c513F9 \
forge script script/SendWarpMessage.s.sol:SendWarpMessage \
  --rpc-url http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc \
  --broadcast
```

**Alternative (Direct cast):**

```bash
cast send 0x7B4982e1F7ee384F206417Fb851a1EB143c513F9 \
  "sendMessage(string)" "Test message" \
  --private-key 0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027 \
  --rpc-url http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc
```

### Step 2: Verify Message Delivery

Wait 5-10 seconds for the ICM relayer to process and deliver the message.

```bash
# Wait for relayer
sleep 5

# Check received message on Subnet B
cast call 0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00 \
  "lastMessage()(string)" \
  --rpc-url http://127.0.0.1:9652/ext/bc/2MBFLxCkhVCLXvVeLvzqXrzjAVRQuKj6Aygq49a3dcsKs6AX3k/rpc
```

**Expected Output:**
```
"Test message"
```

### Step 3: Verify Transaction Events

Check the transaction logs to see Warp precompile events:

```bash
# Get transaction receipt (use actual tx hash from send)
cast receipt <TX_HASH> \
  --rpc-url http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc
```

**Look for:**
- Event from Teleporter Messenger (`0x253b2784...`)
- Event from Warp Precompile (`0x0200000000000000000000000000000000000005`)

---

## Architecture & Technical Details

### Network Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│    Subnet A         │         │    Subnet B         │
│  (Chain ID: 1001)   │         │  (Chain ID: 1002)   │
├─────────────────────┤         ├─────────────────────┤
│                     │         │                     │
│   WarpSender        │         │   WarpReceiver      │
│   0x7B4982e1...     │         │   0xA4cD3b0E...     │
│         │           │         │         ▲           │
│         ▼           │         │         │           │
│  Teleporter Msg     │         │  Teleporter Msg     │
│  0x253b2784...      │         │  0x253b2784...      │
│         │           │         │         ▲           │
│         ▼           │         │         │           │
│  Warp Precompile    │────────▶│  Warp Precompile    │
│  0x020000...0005    │  Relay  │  0x020000...0005    │
│                     │         │                     │
└─────────────────────┘         └─────────────────────┘
                │                         ▲
                └─────────┬───────────────┘
                          │
                    ICM Relayer
              (watches both chains)
```

### Message Flow

1. **User calls** `WarpSender.sendMessage("Hello")`
2. **WarpSender** creates `TeleporterMessageInput` struct
3. **Teleporter Messenger** validates and encodes message
4. **Teleporter Messenger** calls Warp Precompile
5. **Warp Precompile** emits signed Warp message
6. **ICM Relayer** detects the Warp message event
7. **ICM Relayer** fetches signatures from validators
8. **ICM Relayer** submits message to Subnet B
9. **Warp Precompile (Subnet B)** verifies signatures
10. **Teleporter Messenger (Subnet B)** calls `WarpReceiver.receiveTeleporterMessage()`
11. **WarpReceiver** decodes and stores the message

### Key Components

#### 1. Teleporter Messenger
- **Address**: `0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf`
- **Purpose**: Protocol-level message routing
- **Functions**:
  - `sendCrossChainMessage()`: Send messages
  - `getBlockchainID()`: Get current blockchain ID
  - `receiveTeleporterMessage()`: Receive callback

#### 2. Warp Precompile
- **Address**: `0x0200000000000000000000000000000000000005`
- **Purpose**: Low-level cross-subnet communication
- **Functions**:
  - `getBlockchainID()`: Returns chain's blockchain ID
  - Signature aggregation for validators
  - Message verification

#### 3. ICM Relayer
- **Purpose**: Watches for Warp messages and relays them
- **Config**: `/home/madtitan/.avalanche-cli/runs/network_*/icm-relayer-config.json`
- **Metrics Port**: 9092
- **Process**: Runs automatically with local network

### Data Structures

#### TeleporterMessageInput
```solidity
struct TeleporterMessageInput {
    bytes32 destinationBlockchainID;  // Target chain
    address destinationAddress;        // Target contract
    TeleporterFeeInfo feeInfo;        // Relayer fees
    uint256 requiredGasLimit;         // Gas for execution
    address[] allowedRelayerAddresses; // Whitelist (empty = any)
    bytes message;                     // Encoded payload
}
```

#### TeleporterFeeInfo
```solidity
struct TeleporterFeeInfo {
    address feeTokenAddress;  // ERC20 token or address(0) for native
    uint256 amount;           // Fee amount
}
```

### Security Considerations

1. **Authentication**: `receiveTeleporterMessage` should verify `msg.sender == MESSENGER`
2. **Reentrancy**: Use standard guards on receiver
3. **Gas Limits**: Set appropriate `requiredGasLimit` (default 100000)
4. **Fee Handling**: Consider relayer incentives for mainnet
5. **Message Validation**: Decode and validate payload format

---

## Troubleshooting

### Issue: "StackUnderflow" on getBlockchainID

**Cause**: Warp precompile not properly initialized or incompatible version.

**Solution**: This is expected during development. The issue was with calling getBlockchainID() through Teleporter. Verify the network setup:

```bash
# Check if precompile exists
cast code 0x0200000000000000000000000000000000000005 \
  --rpc-url http://127.0.0.1:9650/ext/bc/{blockchain_id}/rpc
```

Should return `0x01` (precompile marker).

### Issue: Message Not Delivered

**Check Relayer Status:**

```bash
# Verify relayer is running
ps aux | grep icm-relayer

# Check relayer logs
tail -f ~/.avalanche-cli/runs/network_*/icm-relayer-storage/*.log
```

**Verify Configuration:**

```bash
# Ensure contracts are properly configured
cast call $SENDER_ADDRESS "remoteReceiver()(address)" \
  --rpc-url $SUBNET_A_RPC

cast call $SENDER_ADDRESS "remoteBlockchainId()(bytes32)" \
  --rpc-url $SUBNET_A_RPC
```

### Issue: Transaction Reverts

**Check Gas Limits:**

```bash
# Increase gas limit
cast send $SENDER_ADDRESS "sendMessage(string)" "Test" \
  --gas-limit 1000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $SUBNET_A_RPC
```

**Verify Balances:**

```bash
# Check account balance on both chains
cast balance 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC \
  --rpc-url $SUBNET_A_RPC

cast balance 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC \
  --rpc-url $SUBNET_B_RPC
```

### Issue: Wrong Blockchain ID Format

**Problem**: Using CB58 format instead of hex.

**Solution**: Always convert using the CB58 decoder:

```bash
python3 decode_cb58.py <CB58_BLOCKCHAIN_ID>
```

### Issue: Network Not Starting

```bash
# Stop existing network
avalanche network stop

# Clean old data
avalanche network clean

# Restart
avalanche subnet deploy subnetA --local
avalanche subnet deploy subnetB --local
```

---

## Reference Commands

### Quick Reference

```bash
# Network Management
avalanche subnet create <name>
avalanche subnet deploy <name> --local
avalanche network status
avalanche network stop
avalanche network clean

# Contract Interaction
forge build
forge script <script> --rpc-url <url> --broadcast
cast send <address> <signature> <args> --private-key <key> --rpc-url <url>
cast call <address> <signature> --rpc-url <url>
cast code <address> --rpc-url <url>
cast chain-id --rpc-url <url>

# Blockchain Queries
curl -X POST --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBlockchains","params":{}}' \
  -H 'content-type:application/json;' http://127.0.0.1:9650/ext/bc/P

# Process Management
ps aux | grep avalanche
ps aux | grep icm-relayer
```

---

## Deployed Contract Addresses (Example)

### Subnet A (bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn)
- **Chain ID**: 1001
- **RPC**: http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc
- **WarpSender**: 0x7B4982e1F7ee384F206417Fb851a1EB143c513F9
- **Teleporter Messenger**: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

### Subnet B (2MBFLxCkhVCLXvVeLvzqXrzjAVRQuKj6Aygq49a3dcsKs6AX3k)
- **Chain ID**: 1002  
- **Blockchain ID (Hex)**: 0xb1827c625b4b61ae5cd9efb6b8acf274302add82948e78f6dc160b865149a8d0
- **RPC**: http://127.0.0.1:9652/ext/bc/2MBFLxCkhVCLXvVeLvzqXrzjAVRQuKj6Aygq49a3dcsKs6AX3k/rpc
- **WarpReceiver**: 0xA4cD3b0Eb6E5Ab5d8CE4065BcCD70040ADAB1F00
- **Teleporter Messenger**: 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf

---

## Conclusion

You now have a complete working cross-subnet messaging system on Avalanche! The system demonstrates:

✅ Subnet creation and deployment  
✅ Teleporter/ICM integration  
✅ Cross-chain message sending  
✅ Automated message relaying  
✅ Message delivery verification  

**Next Steps:**
- Add authentication to receiver
- Implement fee mechanisms
- Handle message failures
- Deploy to Fuji testnet
- Prepare for mainnet deployment
