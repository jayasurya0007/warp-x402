// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract SendWarpMessage is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        // REPLACE WITH YOUR DEPLOYED SENDER ADDRESS
        address senderAddress = vm.envOr("SENDER_ADDRESS", address(0));
        require(senderAddress != address(0), "SENDER_ADDRESS env var not set");

        WarpSender sender = WarpSender(senderAddress);

        sender.sendMessage("Hello from subnetA!");

        vm.stopBroadcast();
    }
}
