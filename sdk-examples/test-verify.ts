import { Warp402Factory } from 'avax-warp-pay';
import { ethers } from 'ethers';

const config = {
  privateKey: '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
  senderChain: {
    rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
    chainId: 1001,
    blockchainId: '0x' + 'a'.repeat(64),
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    sender: '0xB8a934dcb74d0E3d1DF6Bce0faC12cD8B18801eD'
  },
  receiverChain: {
    rpc: 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc',
    chainId: 1002,
    blockchainId: '0x' + 'b'.repeat(64),
    messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
    receiver: '0x95CA0a568236fC7413Cd2b794A7da24422c2BBb6'
  }
};

async function test() {
  const warp = Warp402Factory.fromExisting(config);
  
  console.log('💰 Sending payment (0.01 tokens)...');
  const amount = ethers.parseEther('0.01');
  const paymentId = await warp.pay(amount);
  console.log(`✅ Payment sent: ${paymentId}\n`);
  
  console.log('⏳ Waiting for ICM Relayer to process cross-chain message...\n');
  for (let i = 1; i <= 15; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`🔍 Checking verification (attempt ${i}/15)...`);
    const verified = await warp.verify(paymentId);
    
    if (verified) {
      console.log(`✅ Verified: ${verified}\n`);
      console.log('🎉 SUCCESS! Payment successfully verified on receiver chain!');
      console.log('The ICM Relayer successfully relayed the cross-chain message.');
      return;
    } else {
      console.log(`   Status: NOT FOUND (relayer processing...)`);
    }
  }
  
  console.log('\n⚠️ Payment not verified after 30 seconds');
  console.log('Possible reasons:');
  console.log('  1. ICM Relayer needs more time (this is normal for local networks)');
  console.log('  2. Relayer configuration may need adjustment');
  console.log('  3. Cross-chain message still in transit');
}

test().catch(console.error);
