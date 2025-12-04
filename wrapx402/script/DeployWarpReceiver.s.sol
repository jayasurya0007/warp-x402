// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {WarpReceiver} from "src/WarpReceiver.sol";
import {Script, console} from "forge-std/Script.sol";

contract DeployWarpReceiver is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        // Teleporter Messenger Address (Standard for Avalanche Local Network)
        address messenger = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;

        WarpReceiver receiver = new WarpReceiver(messenger);

        console.log("WarpReceiver deployed at:", address(receiver));

        vm.stopBroadcast();
    }
}
