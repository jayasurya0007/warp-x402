// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WarpSender} from "../src/WarpSender.sol";
import {ITeleporterMessenger} from "../src/TeleporterInterfaces.sol";

contract MockTeleporter {
    struct MessageCall {
        bytes32 destinationBlockchainID;
        address destinationAddress;
        uint256 gasLimit;
        bytes message;
    }
    
    MessageCall private _lastMessage;
    uint256 public messageCount;
    
    function sendCrossChainMessage(
        ITeleporterMessenger.TeleporterMessageInput calldata input
    ) external returns (uint256) {
        _lastMessage = MessageCall({
            destinationBlockchainID: input.destinationBlockchainID,
            destinationAddress: input.destinationAddress,
            gasLimit: input.requiredGasLimit,
            message: input.message
        });
        messageCount++;
        return messageCount;
    }
    
    function getLastMessage() external view returns (MessageCall memory) {
        return _lastMessage;
    }
}

contract WarpSenderTest is Test {
    WarpSender public sender;
    MockTeleporter public teleporter;
    
    address public owner = address(this);
    address public user = address(0x1);
    address public receiver = address(0x2);
    bytes32 public remoteChainId = bytes32(uint256(1));
    
    // Allow test contract to receive ether
    receive() external payable {}
    
    event PaymentSent(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        bytes32 destinationChainId,
        address destinationReceiver
    );
    
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event GasLimitUpdated(uint256 messageGasLimit, uint256 paymentGasLimit);
    event RemoteReceiverUpdated(bytes32 blockchainId, address receiver);
    
    function setUp() public {
        teleporter = new MockTeleporter();
        sender = new WarpSender(address(teleporter));
        
        // Configure remote receiver
        sender.setRemoteReceiver(remoteChainId, receiver);
        
        // Fund user
        vm.deal(user, 10 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testInitialOwner() public view {
        assertEq(sender.owner(), owner);
    }
    
    function testInitialMessenger() public view {
        assertEq(address(sender.MESSENGER()), address(teleporter));
    }
    
    function testInitialGasLimits() public view {
        assertEq(sender.defaultGasLimit(), 200000);
        assertEq(sender.messageGasLimit(), 100000);
    }
    
    /*//////////////////////////////////////////////////////////////
                        ACCESS CONTROL TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testOnlyOwnerCanSetRemoteReceiver() public {
        vm.prank(user);
        vm.expectRevert();
        sender.setRemoteReceiver(remoteChainId, receiver);
    }
    
    function testOwnerCanSetRemoteReceiver() public {
        bytes32 newChainId = bytes32(uint256(2));
        address newReceiver = address(0x3);
        
        vm.expectEmit(true, true, false, false);
        emit RemoteReceiverUpdated(newChainId, newReceiver);
        
        sender.setRemoteReceiver(newChainId, newReceiver);
        
        assertEq(sender.remoteBlockchainId(), newChainId);
        assertEq(sender.remoteReceiver(), newReceiver);
    }
    
    function testCannotSetZeroReceiver() public {
        vm.expectRevert("Invalid receiver address");
        sender.setRemoteReceiver(remoteChainId, address(0));
    }
    
    function testCannotSetZeroChainId() public {
        vm.expectRevert("Invalid blockchain ID");
        sender.setRemoteReceiver(bytes32(0), receiver);
    }
    
    function testOnlyOwnerCanSetGasLimits() public {
        vm.prank(user);
        vm.expectRevert();
        sender.setGasLimits(150000, 250000);
    }
    
    function testOwnerCanSetGasLimits() public {
        vm.expectEmit(false, false, false, true);
        emit GasLimitUpdated(150000, 250000);
        
        sender.setGasLimits(150000, 250000);
        
        assertEq(sender.messageGasLimit(), 150000);
        assertEq(sender.defaultGasLimit(), 250000);
    }
    
    function testCannotSetInvalidGasLimits() public {
        vm.expectRevert("Invalid message gas limit");
        sender.setGasLimits(0, 200000);
        
        vm.expectRevert("Invalid payment gas limit");
        sender.setGasLimits(100000, 0);
        
        vm.expectRevert("Invalid message gas limit");
        sender.setGasLimits(1000001, 200000);
    }
    
    /*//////////////////////////////////////////////////////////////
                        PAYMENT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testSendPayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        uint256 amount = 1 ether;
        
        vm.prank(user);
        sender.sendPayment{value: amount}(paymentId);
        
        assertEq(teleporter.messageCount(), 1);
        assertEq(sender.getBalance(), amount);
    }
    
    function testSendPaymentEmitsEvent() public {
        bytes32 paymentId = bytes32(uint256(123));
        uint256 amount = 1 ether;
        
        vm.prank(user);
        // Note: event has secure payment ID (hashed), not original
        vm.expectEmit(false, true, false, false);
        emit PaymentSent(paymentId, user, amount, remoteChainId, receiver);
        
        sender.sendPayment{value: amount}(paymentId);
    }
    
    function testCannotSendZeroPayment() public {
        bytes32 paymentId = bytes32(uint256(123));
        
        vm.prank(user);
        vm.expectRevert("Payment amount must be greater than 0");
        sender.sendPayment{value: 0}(paymentId);
    }
    
    function testCannotSendWithZeroPaymentId() public {
        vm.prank(user);
        vm.expectRevert("Payment ID cannot be empty");
        sender.sendPayment{value: 1 ether}(bytes32(0));
    }
    
    function testCannotSendWhenReceiverNotSet() public {
        WarpSender newSender = new WarpSender(address(teleporter));
        
        vm.prank(user);
        vm.expectRevert("Receiver not set");
        newSender.sendPayment{value: 1 ether}(bytes32(uint256(123)));
    }
    
    /*//////////////////////////////////////////////////////////////
                        MESSAGE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testSendMessage() public {
        vm.prank(user);
        sender.sendMessage("Hello");
        
        assertEq(teleporter.messageCount(), 1);
        MockTeleporter.MessageCall memory lastMsg = teleporter.getLastMessage();
        assertEq(lastMsg.gasLimit, 100000);
    }
    
    /*//////////////////////////////////////////////////////////////
                        WITHDRAWAL TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testWithdrawFunds() public {
        // Send payment to contract
        vm.prank(user);
        sender.sendPayment{value: 1 ether}(bytes32(uint256(123)));
        
        uint256 ownerBalanceBefore = owner.balance;
        
        vm.expectEmit(true, false, false, true);
        emit FundsWithdrawn(owner, 1 ether);
        
        sender.withdraw();
        
        assertEq(sender.getBalance(), 0);
        assertEq(owner.balance, ownerBalanceBefore + 1 ether);
    }
    
    function testWithdrawAmount() public {
        // Send payment
        vm.prank(user);
        sender.sendPayment{value: 2 ether}(bytes32(uint256(123)));
        
        uint256 ownerBalanceBefore = owner.balance;
        
        sender.withdrawAmount(1 ether);
        
        assertEq(sender.getBalance(), 1 ether);
        assertEq(owner.balance, ownerBalanceBefore + 1 ether);
    }
    
    function testCannotWithdrawWhenEmpty() public {
        vm.expectRevert("No funds to withdraw");
        sender.withdraw();
    }
    
    function testCannotWithdrawMoreThanBalance() public {
        vm.prank(user);
        sender.sendPayment{value: 1 ether}(bytes32(uint256(123)));
        
        vm.expectRevert("Insufficient balance");
        sender.withdrawAmount(2 ether);
    }
    
    function testOnlyOwnerCanWithdraw() public {
        vm.prank(user);
        sender.sendPayment{value: 1 ether}(bytes32(uint256(123)));
        
        vm.prank(user);
        vm.expectRevert();
        sender.withdraw();
    }
    
    /*//////////////////////////////////////////////////////////////
                        PAUSE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testOwnerCanPause() public {
        sender.pause();
        assertTrue(sender.paused());
    }
    
    function testOwnerCanUnpause() public {
        sender.pause();
        sender.unpause();
        assertFalse(sender.paused());
    }
    
    function testOnlyOwnerCanPause() public {
        vm.prank(user);
        vm.expectRevert();
        sender.pause();
    }
    
    function testCannotSendPaymentWhenPaused() public {
        sender.pause();
        
        vm.prank(user);
        vm.expectRevert();
        sender.sendPayment{value: 1 ether}(bytes32(uint256(123)));
    }
    
    function testCannotSendMessageWhenPaused() public {
        sender.pause();
        
        vm.prank(user);
        vm.expectRevert();
        sender.sendMessage("Hello");
    }
    
    /*//////////////////////////////////////////////////////////////
                        RECEIVE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function testCanReceiveEther() public {
        vm.prank(user);
        (bool success,) = address(sender).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(sender.getBalance(), 1 ether);
    }
}
