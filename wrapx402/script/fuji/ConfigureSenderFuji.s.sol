// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../../src/WarpSender.sol";

contract ConfigureSenderFuji is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address senderAddress = vm.envAddress("SENDER_ADDRESS");
        address receiverAddress = vm.envAddress("RECEIVER_ADDRESS");
        // Fuji C-Chain blockchain ID (both on same chain, so use C-Chain ID)
        bytes32 remoteBlockchainId = bytes32(uint256(43113)); // Fuji C-Chain
        
        console.log("===================================");
        console.log("Configuring WarpSender on Fuji C-Chain");
        console.log("===================================");
        console.log("Sender:", senderAddress);
        console.log("Receiver:", receiverAddress);
        console.log("Blockchain ID:", uint256(remoteBlockchainId));
        
        vm.startBroadcast(deployerPrivateKey);
        
        WarpSender sender = WarpSender(payable(senderAddress));
        sender.setRemoteReceiver(remoteBlockchainId, receiverAddress);
        
        console.log("");
        console.log("SUCCESS!");
        console.log("Configuration complete");
        
        vm.stopBroadcast();
        
        // Verify configuration
        address configuredReceiver = sender.remoteReceiver();
        bytes32 configuredBlockchainId = sender.remoteBlockchainId();
        
        console.log("");
        console.log("=== VERIFICATION ===");
        console.log("Configured receiver:", configuredReceiver);
        console.log("Configured blockchain ID:", uint256(configuredBlockchainId));
        
        require(configuredReceiver == receiverAddress, "Receiver mismatch");
        require(configuredBlockchainId == remoteBlockchainId, "Blockchain ID mismatch");
        
        console.log("Verification PASSED!");
    }
}
