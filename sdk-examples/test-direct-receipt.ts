import { ethers } from 'ethers';

// WarpReceiver ABI
const RECEIVER_ABI = [
  'function getReceipt(bytes32 paymentId) view returns (tuple(bytes32 paymentId, uint256 amount, address payer, uint256 timestamp, bool consumed))'
];

async function testGetReceipt() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc');
  
  const receiverAddress = '0xf606475e888A22d85b43DF58b0aB6b2EAf7ac1c1';
  const paymentId = '0x486062909e9a764cc4398779f65ff306b280c44d94f8221f4ed0f7df553b843d';
  
  const receiver = new ethers.Contract(receiverAddress, RECEIVER_ABI, provider);
  
  console.log('Testing getReceipt() directly...');
  console.log(`Payment ID: ${paymentId}\n`);
  
  try {
    const receipt = await receiver.getReceipt(paymentId);
    console.log('✅ Receipt found!');
    console.log(`  Amount: ${ethers.formatEther(receipt.amount)} tokens`);
    console.log(`  Payer: ${receipt.payer}`);
    console.log(`  Timestamp: ${receipt.timestamp}`);
    console.log(`  Consumed: ${receipt.consumed}`);
    console.log(`  Payment ID from receipt: ${receipt.paymentId}`);
    console.log('\n✅ THE PAYMENT EXISTS! verify() should return TRUE!');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
    
    if (error.message.includes('Payment not found')) {
      console.log('\nPayment really doesn\'t exist in the receiver contract.');
      console.log('This means the message was not processed.');
    }
  }
}

testGetReceipt().catch(console.error);
