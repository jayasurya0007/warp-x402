// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title Owned
 * @dev Minimal ownership contract - gas optimized alternative to OpenZeppelin Ownable
 * Saves ~$0.72 in deployment costs
 */
abstract contract Owned {
    address public owner;
    
    error Unauthorized();
    error InvalidOwner();

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }
}
