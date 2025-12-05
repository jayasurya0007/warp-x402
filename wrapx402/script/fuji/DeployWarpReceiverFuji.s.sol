// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WarpReceiver} from "../../src/WarpReceiver.sol";

contract DeployWarpReceiverFuji is Script {
    // Fuji C-Chain Teleporter Messenger (both contracts use same)
    address constant MESSENGER = 0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("===================================");
        console.log("Deploying WarpReceiver to Fuji C-Chain");
        console.log("===================================");
        console.log("Teleporter Messenger:", MESSENGER);
        
        vm.startBroadcast(deployerPrivateKey);
        
        WarpReceiver receiver = new WarpReceiver(MESSENGER);
        
        console.log("");
        console.log("SUCCESS!");
        console.log("WarpReceiver deployed at:", address(receiver));
        console.log("Network: Fuji C-Chain");
        console.log("Explorer: https://testnet.snowtrace.io/address/", address(receiver));
        
        vm.stopBroadcast();
    }
}
