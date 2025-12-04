// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Script, console} from "forge-std/Script.sol";
import {WarpReceiver} from "../src/WarpReceiver.sol";

contract VerifyPayment is Script {
    function run() external view {
        address receiverAddress = vm.envOr("RECEIVER_ADDRESS", address(0));
        require(receiverAddress != address(0), "RECEIVER_ADDRESS env var not set");

        bytes32 paymentId = vm.envBytes32("PAYMENT_ID");
        require(paymentId != bytes32(0), "PAYMENT_ID env var not set");

        WarpReceiver receiver = WarpReceiver(receiverAddress);

        console.log("Checking payment ID:");
        console.logBytes32(paymentId);

        bool paid = receiver.hasPaid(paymentId);
        console.log("Payment found:", paid);

        if (paid) {
            WarpReceiver.PaymentReceipt memory receipt = receiver.getReceipt(paymentId);
            console.log("Payment details:");
            console.log("  Amount:", receipt.amount);
            console.log("  Payer:", receipt.payer);
            console.log("  Timestamp:", receipt.timestamp);
            console.log("  Consumed:", receipt.consumed);
        }
    }
}
