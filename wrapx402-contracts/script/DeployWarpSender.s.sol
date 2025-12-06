// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../src/WarpSender.sol";

contract DeployWarpSender is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        // Teleporter Messenger Address (Standard for Avalanche Local Network)
        address messenger = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;

        WarpSender sender = new WarpSender(messenger);

        console.log("WarpSender deployed at:", address(sender));

        vm.stopBroadcast();
    }
}

