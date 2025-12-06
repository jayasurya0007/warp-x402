// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../../src/WarpSender.sol";

contract SendPaymentFuji is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address senderAddress = vm.envAddress("SENDER_ADDRESS");
        
        // Generate unique payment ID
        bytes32 paymentId = keccak256(abi.encodePacked("fuji-demo-payment-", block.timestamp));
        uint256 paymentAmount = 0.01 ether; // 0.01 AVAX
        
        console.log("Sending payment on Fuji C-Chain...");
        console.log("Sender:", senderAddress);
        console.log("Payment ID:", vm.toString(paymentId));
        console.log("Amount:", paymentAmount);
        
        vm.startBroadcast(deployerPrivateKey);
        
        WarpSender sender = WarpSender(payable(senderAddress));
        sender.sendPayment{value: paymentAmount}(paymentId);
        
        console.log("Payment sent successfully!");
        console.log("Wait ~60 seconds for ICM relayer to deliver...");
        
        vm.stopBroadcast();
    }
}
