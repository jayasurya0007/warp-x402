// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IWarpMessenger {
    function sendWarpMessage(bytes32 destinationBlockchainID, address destinationAddress, bytes calldata payload, uint256 gasLimit, address refundAddress) external returns (bytes32);
    function sendWarpMessage(bytes32 destinationBlockchainID, address destinationAddress, bytes calldata payload, uint256 gasLimit) external returns (bytes32);
    function sendWarpMessage(bytes32 destinationBlockchainID, address destinationAddress, bytes calldata payload) external returns (bytes32);
    function sendWarpMessage(bytes32 destinationBlockchainID, bytes calldata payload) external returns (bytes32);
    function getBlockchainID() external view returns (bytes32);
}

contract DirectWarpSender {
    IWarpMessenger public constant WARP = IWarpMessenger(0x0200000000000000000000000000000000000005);
    
    // Configured remote destination
    bytes32 public remoteBlockchainId;
    address public remoteReceiver;

    // Configure remote subnet receiver
    function setRemoteReceiver(bytes32 _remoteBlockchainId, address _remoteReceiver) external {
        remoteBlockchainId = _remoteBlockchainId;
        remoteReceiver = _remoteReceiver;
    }

    // Sends message to remote subnet using Warp directly
    function sendMessage(string calldata message) external payable {
        require(remoteReceiver != address(0), "Receiver not set");
        require(remoteBlockchainId != bytes32(0), "Remote Chain ID not set");

        bytes memory payload = abi.encode(msg.sender, remoteReceiver, message);
        
        // Try different signatures
        try WARP.sendWarpMessage(remoteBlockchainId, payload) returns (bytes32) {
            // Success with simple signature
        } catch {
            // Fallback - this will revert if none work
            WARP.sendWarpMessage(remoteBlockchainId, remoteReceiver, payload);
        }
    }
    
    function getLocalBlockchainID() external view returns (bytes32) {
        return WARP.getBlockchainID();
    }
}
