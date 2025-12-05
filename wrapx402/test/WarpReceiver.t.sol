// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WarpReceiver} from "../src/WarpReceiver.sol";

contract WarpReceiverTest is Test {
    WarpReceiver public receiver;
    
    address public owner = address(this);
    address public teleporter = address(0x1);
    address public approvedSender = address(0x2);
    address public user = address(0x3);
    bytes32 public approvedChainId = bytes32(uint256(1));
    
    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    event PaymentConsumed(
        bytes32 indexed paymentId,
        address indexed consumer
    );
    
    function setUp() public {
        receiver = new WarpReceiver(teleporter);
        receiver.setApprovedSender(approvedChainId, approvedSender);
    }
    
    /*//////////////////////////////////////////////////////////////
                        INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testInitialOwner() public view {
        assertEq(receiver.owner(), owner);
    }
    
    function testInitialMessenger() public view {
        assertEq(receiver.MESSENGER(), teleporter);
    }
    
    function testInitialPaymentExpiry() public view {
        assertEq(receiver.paymentExpiryTime(), 7 days);
    }
    
    /*//////////////////////////////////////////////////////////////
                        ACCESS CONTROL TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testOnlyOwnerCanSetApprovedSender() public {
        vm.prank(user);
        vm.expectRevert();
        receiver.setApprovedSender(approvedChainId, approvedSender);
    }
    
    function testOwnerCanSetApprovedSender() public {
        bytes32 newChainId = bytes32(uint256(2));
        address newSender = address(0x4);
        
        receiver.setApprovedSender(newChainId, newSender);
        
        assertEq(receiver.approvedSourceBlockchainId(), newChainId);
        assertEq(receiver.approvedSender(), newSender);
    }
    
    function testCannotSetZeroApprovedSender() public {
        vm.expectRevert("Invalid sender address");
        receiver.setApprovedSender(approvedChainId, address(0));
    }
    
    function testOnlyOwnerCanSetRequiredAmount() public {
        vm.prank(user);
        vm.expectRevert();
        receiver.setRequiredPaymentAmount(1 ether);
    }
    
    function testOwnerCanSetRequiredAmount() public {
        receiver.setRequiredPaymentAmount(1 ether);
        assertEq(receiver.requiredPaymentAmount(), 1 ether);
    }
    
    function testOnlyOwnerCanSetExpiryTime() public {
        vm.prank(user);
        vm.expectRevert();
        receiver.setPaymentExpiryTime(1 days);
    }
    
    function testOwnerCanSetExpiryTime() public {
        receiver.setPaymentExpiryTime(1 days);
        assertEq(receiver.paymentExpiryTime(), 1 days);
    }
    
    /*//////////////////////////////////////////////////////////////
                        PAYMENT RECEIPT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testReceivePaymentReceipt() public {
        bytes32 paymentId = bytes32(uint256(123));
        uint256 amount = 1 ether;
        address payer = address(0x5);
        
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: amount,
            payer: payer,
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(teleporter);
        vm.expectEmit(true, true, false, true);
        emit PaymentReceived(paymentId, payer, amount, block.timestamp);
        
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
        
        assertTrue(receiver.hasPaid(paymentId));
    }
    
    function testCannotReceiveDuplicatePayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: 1 ether,
            payer: address(0x5),
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        // First payment succeeds
        vm.prank(teleporter);
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
        
        // Second payment with same ID fails
        vm.prank(teleporter);
        vm.expectRevert("Duplicate payment ID");
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
    }
    
    function testCannotReceiveInsufficientPayment() public {
        receiver.setRequiredPaymentAmount(2 ether);
        
        bytes32 paymentId = bytes32(uint256(123));
        
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: 1 ether, // Less than required
            payer: address(0x5),
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(teleporter);
        vm.expectRevert("Insufficient payment amount");
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
    }
    
    function testOnlyTeleporterCanReceiveMessage() public {
        bytes32 paymentId = bytes32(uint256(123));
        
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: 1 ether,
            payer: address(0x5),
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(user);
        vm.expectRevert("Unauthorized: Not Teleporter Messenger");
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
    }
    
    function testCannotReceiveFromUnauthorizedChain() public {
        bytes32 unauthorizedChainId = bytes32(uint256(999));
        bytes32 paymentId = bytes32(uint256(123));
        
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: 1 ether,
            payer: address(0x5),
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(teleporter);
        vm.expectRevert("Unauthorized: Invalid Source Chain");
        receiver.receiveTeleporterMessage(unauthorizedChainId, approvedSender, message);
    }
    
    function testCannotReceiveFromUnauthorizedSender() public {
        address unauthorizedSender = address(0x999);
        bytes32 paymentId = bytes32(uint256(123));
        
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: 1 ether,
            payer: address(0x5),
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(teleporter);
        vm.expectRevert("Unauthorized: Invalid Sender");
        receiver.receiveTeleporterMessage(approvedChainId, unauthorizedSender, message);
    }
    
    /*//////////////////////////////////////////////////////////////
                        PAYMENT QUERY TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testHasPaid() public {
        bytes32 paymentId = bytes32(uint256(123));
        assertFalse(receiver.hasPaid(paymentId));
        
        // Add payment
        _addPayment(paymentId, 1 ether, address(0x5));
        
        assertTrue(receiver.hasPaid(paymentId));
    }
    
    function testGetReceipt() public {
        bytes32 paymentId = bytes32(uint256(123));
        uint256 amount = 1 ether;
        address payer = address(0x5);
        
        _addPayment(paymentId, amount, payer);
        
        WarpReceiver.PaymentReceipt memory receipt = receiver.getReceipt(paymentId);
        
        assertEq(receipt.paymentId, paymentId);
        assertEq(receipt.amount, amount);
        assertEq(receipt.payer, payer);
        assertFalse(receipt.consumed);
    }
    
    function testCannotGetNonExistentReceipt() public {
        bytes32 paymentId = bytes32(uint256(123));
        
        vm.expectRevert("Payment not found");
        receiver.getReceipt(paymentId);
    }
    
    /*//////////////////////////////////////////////////////////////
                        CONSUMPTION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testConsumePayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        assertFalse(receiver.isConsumed(paymentId));
        
        vm.expectEmit(true, true, false, false);
        emit PaymentConsumed(paymentId, address(this));
        
        receiver.consumePayment(paymentId);
        
        assertTrue(receiver.isConsumed(paymentId));
    }
    
    function testCannotConsumeNonExistentPayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        
        vm.expectRevert("Payment not found");
        receiver.consumePayment(paymentId);
    }
    
    function testCannotConsumeAlreadyConsumed() public {
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        receiver.consumePayment(paymentId);
        
        vm.expectRevert("Payment already consumed");
        receiver.consumePayment(paymentId);
    }
    
    /*//////////////////////////////////////////////////////////////
                        EXPIRY TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testPaymentExpiry() public {
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        assertFalse(receiver.isExpired(paymentId));
        
        // Warp time forward past expiry
        vm.warp(block.timestamp + 7 days + 1);
        
        assertTrue(receiver.isExpired(paymentId));
    }
    
    function testCannotConsumeExpiredPayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        // Warp past expiry
        vm.warp(block.timestamp + 7 days + 1);
        
        vm.expectRevert("Payment has expired");
        receiver.consumePayment(paymentId);
    }
    
    function testNoExpiryWhenSetToZero() public {
        receiver.setPaymentExpiryTime(0);
        
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        // Warp far into future
        vm.warp(block.timestamp + 365 days);
        
        // Still not expired
        assertFalse(receiver.isExpired(paymentId));
        
        // Can still consume
        receiver.consumePayment(paymentId);
        assertTrue(receiver.isConsumed(paymentId));
    }
    
    function testIsValidPayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        
        // Non-existent payment
        assertFalse(receiver.isValidPayment(paymentId));
        
        // Add payment
        _addPayment(paymentId, 1 ether, address(0x5));
        assertTrue(receiver.isValidPayment(paymentId));
        
        // Consume it
        receiver.consumePayment(paymentId);
        assertFalse(receiver.isValidPayment(paymentId));
    }
    
    function testIsValidPaymentWithExpiry() public {
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        assertTrue(receiver.isValidPayment(paymentId));
        
        // Warp past expiry
        vm.warp(block.timestamp + 7 days + 1);
        
        assertFalse(receiver.isValidPayment(paymentId));
    }
    
    /*//////////////////////////////////////////////////////////////
                        PAUSE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testOwnerCanPause() public {
        receiver.pause();
        assertTrue(receiver.paused());
    }
    
    function testOwnerCanUnpause() public {
        receiver.pause();
        receiver.unpause();
        assertFalse(receiver.paused());
    }
    
    function testOnlyOwnerCanPause() public {
        vm.prank(user);
        vm.expectRevert();
        receiver.pause();
    }
    
    function testCannotConsumeWhenPaused() public {
        bytes32 paymentId = bytes32(uint256(123));
        _addPayment(paymentId, 1 ether, address(0x5));
        
        receiver.pause();
        
        vm.expectRevert();
        receiver.consumePayment(paymentId);
    }
    
    function testCannotReceiveMessageWhenPaused() public {
        receiver.pause();
        
        bytes32 paymentId = bytes32(uint256(123));
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: 1 ether,
            payer: address(0x5),
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(teleporter);
        vm.expectRevert();
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
    }
    
    /*//////////////////////////////////////////////////////////////
                        STRING MESSAGE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testReceiveStringMessage() public {
        string memory testMessage = "Hello World";
        bytes memory message = abi.encode(testMessage);
        
        vm.prank(teleporter);
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
        
        assertEq(receiver.lastMessage(), testMessage);
    }
    
    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    
    function _addPayment(bytes32 paymentId, uint256 amount, address payer) internal {
        WarpReceiver.PaymentReceipt memory receipt = WarpReceiver.PaymentReceipt({
            paymentId: paymentId,
            amount: amount,
            payer: payer,
            timestamp: block.timestamp,
            consumed: false
        });
        
        bytes memory message = abi.encode(receipt);
        
        vm.prank(teleporter);
        receiver.receiveTeleporterMessage(approvedChainId, approvedSender, message);
    }
}
