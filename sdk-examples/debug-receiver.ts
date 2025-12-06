import { ethers } from 'ethers';

const receiverRpc = 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc';
const receiverAddress = '0xE3573540ab8A1C4c754Fd958Dc1db39BBE81b208';

// WarpReceiver ABI (just the functions we need)
const receiverABI = [
  'function payments(bytes32) view returns (address sender, uint256 amount, bool consumed)',
  'function teleporterMessenger() view returns (address)'
];

async function debug() {
  const provider = new ethers.JsonRpcProvider(receiverRpc);
  const receiver = new ethers.Contract(receiverAddress, receiverABI, provider);
  
  console.log('🔍 Debugging WarpReceiver Contract\n');
  console.log(`Receiver Address: ${receiverAddress}`);
  console.log(`RPC: ${receiverRpc}\n`);
  
  try {
    const messenger = await receiver.teleporterMessenger();
    console.log(`Teleporter Messenger: ${messenger}`);
    
    // Try to check a payment
    const paymentId = '0xde6aa122d1d66e7a540a90431e70d5cc4a5b524a58616aad3257cec16996d2ea';
    console.log(`\nChecking payment: ${paymentId}`);
    
    const payment = await receiver.payments(paymentId);
    console.log(`Result: sender=${payment.sender}, amount=${payment.amount}, consumed=${payment.consumed}`);
    
    if (payment.amount > 0n) {
      console.log('\n✅ PAYMENT FOUND IN CONTRACT!');
    } else {
      console.log('\n❌ Payment not found in contract storage');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

debug().catch(console.error);
