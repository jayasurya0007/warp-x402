// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract SendStringMessage is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        address senderAddress = vm.envOr("SENDER_ADDRESS", address(0));
        WarpSender sender = WarpSender(senderAddress);

        console.log("Sending string message...");
        sender.sendMessage("Test String Message");

        vm.stopBroadcast();
    }
}
