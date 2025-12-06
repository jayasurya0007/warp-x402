import { ethers } from 'ethers';

// WarpReceiver ABI (just the functions we need)
const RECEIVER_ABI = [
  'function approvedSender() view returns (address)',
  'function approvedSourceBlockchainId() view returns (bytes32)',
  'function hasPaid(bytes32) view returns (bool)',
  'function payments(bytes32) view returns (tuple(bytes32 paymentId, uint256 amount, address payer, uint256 timestamp, bool consumed))'
];

async function debugReceiver() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc');
  
  const receiverAddress = '0xf606475e888A22d85b43DF58b0aB6b2EAf7ac1c1';
  const senderAddress = '0xe36A95a391B6889355524d3855B4f9c881fd546A';
  const expectedBlockchainId = '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3';
  
  const receiver = new ethers.Contract(receiverAddress, RECEIVER_ABI, provider);
  
  console.log('═══ WarpReceiver Configuration ═══\n');
  console.log(`Receiver: ${receiverAddress}`);
  console.log(`Expected Sender: ${senderAddress}`);
  console.log(`Expected Blockchain: ${expectedBlockchainId}\n`);
  
  const approvedSender = await receiver.approvedSender();
  const approvedBlockchainId = await receiver.approvedSourceBlockchainId();
  
  console.log('═══ Actual Configuration ═══\n');
  console.log(`Approved Sender: ${approvedSender}`);
  console.log(`Approved Blockchain: ${approvedBlockchainId}\n`);
  
  console.log('═══ Match Status ═══\n');
  
  const senderMatch = approvedSender.toLowerCase() === senderAddress.toLowerCase();
  const blockchainMatch = approvedBlockchainId === expectedBlockchainId;
  
  console.log(`Sender Match: ${senderMatch ? '✅' : '❌'}`);
  if (!senderMatch) {
    console.log(`  Expected: ${senderAddress}`);
    console.log(`  Got:      ${approvedSender}`);
  }
  
  console.log(`Blockchain Match: ${blockchainMatch ? '✅' : '❌'}`);
  if (!blockchainMatch) {
    console.log(`  Expected: ${expectedBlockchainId}`);
    console.log(`  Got:      ${approvedBlockchainId}`);
  }
  
  if (!senderMatch || !blockchainMatch) {
    console.log('\n⚠️  Configuration mismatch!');
    console.log('This is why payments are rejected.');
    console.log('\nThe receiveTeleporterMessage() function validates:');
    console.log('  1. Origin blockchain ID must match approvedSourceBlockchainId');
    console.log('  2. Origin sender must match approvedSender');
    console.log('\nTo fix: Run quickSetup() again - it configures both correctly.');
  } else {
    console.log('\n✅ Configuration is correct!');
    console.log('Messages should be accepted...');
  }
}

debugReceiver().catch(console.error);
