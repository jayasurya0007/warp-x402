// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {DirectWarpSender} from "../src/DirectWarpSender.sol";

contract DeployDirectWarpSender is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        DirectWarpSender sender = new DirectWarpSender();

        console.log("DirectWarpSender deployed at:", address(sender));

        vm.stopBroadcast();
    }
}
