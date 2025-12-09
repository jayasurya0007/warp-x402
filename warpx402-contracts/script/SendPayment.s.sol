// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract SendPayment is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address payable senderAddress = payable(vm.envOr("SENDER_ADDRESS", address(0)));
        require(senderAddress != address(0), "SENDER_ADDRESS env var not set");

        WarpSender sender = WarpSender(senderAddress);

        // Generate a unique payment ID (in production, this would come from the server's 402 response)
        bytes32 paymentId = keccak256(abi.encodePacked(block.timestamp, msg.sender, "test-payment"));
        uint256 paymentAmount = 1000000000000000000; // 1 token in wei

        console.log("Sending payment with ID:");
        console.logBytes32(paymentId);
        console.log("Amount:", paymentAmount);

        sender.sendPayment{value: paymentAmount}(paymentId);

        console.log("Payment sent successfully!");

        vm.stopBroadcast();
    }
}
