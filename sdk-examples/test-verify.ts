import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

const config = {
  privateKey: '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
  senderChain: {
    rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
    chainId: 1001,
    blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: '0xDFBb4b49DfAe39720f68f8297ADb2368FeffaDdb'
  },
  receiverChain: {
    rpc: 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc',
    chainId: 1002,
    blockchainId: '0xd9123a2d0e43bab99c87ee6a9bca849f161a97cfc66adeeb4b440fd7c906f092',
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0xE3573540ab8A1C4c754Fd958Dc1db39BBE81b208'
  }
};

async function test() {
  const warp = Warp402Factory.fromExisting(config);
  
  console.log('\n🚀 Testing Cross-Chain Payment Verification\n');
  console.log('Configuration:');
  console.log(`  Sender Chain:   SubnetA (${config.senderChain.chainId})`);
  console.log(`  Receiver Chain: SubnetB (${config.receiverChain.chainId})`);
  console.log(`  Sender:   ${config.senderChain.sender}`);
  console.log(`  Receiver: ${config.receiverChain.receiver}\n`);
  
  console.log('💰 Step 1: Sending cross-chain payment (0.01 tokens)...');
  const amount = ethers.parseEther('0.01');
  const paymentId = await warp.pay(amount);
  console.log(`✅ Payment sent: ${paymentId}`);
  console.log(`   Block confirmed on sender chain\n`);
  
  console.log('⏳ Step 2: Waiting for ICM Relayer to process message...');
  console.log('   (The relayer will detect the Warp message and relay it to SubnetB)\n');
  
  let verified = false;
  for (let i = 1; i <= 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    console.log(`🔍 Attempt ${i}/20: Checking payment verification...`);
    
    verified = await warp.verify(paymentId);
    
    if (verified) {
      console.log(`✅ VERIFIED: ${verified}\n`);
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  🎉 SUCCESS! Cross-Chain Payment Verified!           ║');
      console.log('╚════════════════════════════════════════════════════════╝\n');
      console.log('What happened:');
      console.log('  1. Payment was sent on SubnetA (sender chain)');
      console.log('  2. ICM Relayer detected the Warp message');
      console.log('  3. Relayer submitted the message to SubnetB (receiver chain)');
      console.log('  4. WarpReceiver contract verified and stored the payment');
      console.log('  5. SDK successfully verified the payment exists\n');
      console.log('🎊 Your SDK is working perfectly for cross-chain payments!');
      return;
    } else {
      console.log(`   Status: Payment not yet relayed (waiting...)`);
    }
  }
  
  console.log('\n⚠️  Payment not verified after 60 seconds\n');
  console.log('Possible reasons:');
  console.log('  1. ICM Relayer may need more time (cross-chain can take 1-2 minutes)');
  console.log('  2. Check relayer logs: avalanche interchain relayer logs --local --last 10');
  console.log('  3. Verify relayer is running: ps aux | grep relayer\n');
  console.log('Note: The payment WAS successfully sent on the sender chain.');
  console.log('      Verification just means the ICM relayer needs to complete the relay.');
}

test().catch(console.error);
