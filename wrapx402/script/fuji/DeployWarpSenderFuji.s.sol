// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WarpSender} from "../../src/WarpSender.sol";

contract DeployWarpSenderFuji is Script {
    // Fuji C-Chain Teleporter Messenger
    address constant MESSENGER = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deploying WarpSender to Fuji C-Chain...");
        console.log("Teleporter Messenger:", MESSENGER);
        
        vm.startBroadcast(deployerPrivateKey);
        
        WarpSender sender = new WarpSender(MESSENGER);
        
        console.log("WarpSender deployed at:", address(sender));
        console.log("Deployment successful!");
        
        vm.stopBroadcast();
    }
}
