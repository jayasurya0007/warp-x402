import { Warp402Factory } from 'avax-warp-pay';

async function checkLatestPayment() {
  const warp = Warp402Factory.fromExisting({
    privateKey: '0x56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027',
    
    senderChain: {
      rpc: 'http://127.0.0.1:9650/ext/bc/bjoxQvUZv6FcN5SyYosFMziVyCcnbRMi2YTr2vX3rFzaYYJn/rpc',
      chainId: 1001,
      blockchainId: '0x015c25adff71c05f6ae8fde1e1a621ebf677a6a57b0266257758e1e6eb1572c3',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      sender: '0xe36A95a391B6889355524d3855B4f9c881fd546A' // From the last deployment
    },
    
    receiverChain: {
      rpc: 'http://127.0.0.1:9652/ext/bc/2ebnxs92JxZpqhv5wUWZ5TExBVVaUG5xxBjd3wbm6PeuYJ6Un5/rpc',
      chainId: 1002,
      blockchainId: '0xd9123a2d0e43bab99c87ee6a9bca849f161a97cfc66adeeb4b440fd7c906f092',
      messenger: '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf',
      receiver: '0xf606475e888A22d85b43DF58b0aB6b2EAf7ac1c1' // From the last deployment
    }
  });

  // Payment ID from the last run
  const paymentId = '486062909e9a764cc4398779f65ff306b280c44d94f8221f4ed0f7df553b843d';
  
  console.log('Checking payment that was just sent...');
  console.log(`Payment ID: ${paymentId}\n`);
  console.log('Relayer confirmed delivery at 19:48:19');
  console.log('TX: 0x40dc73d380a4bbd8a4894e453c91dbb937f868ab92773d5e734b005886b4a0d2\n');
  
  const verified = await warp.verify(paymentId);
  
  if (verified) {
    console.log('✅ SUCCESS! verify() returned TRUE!');
    console.log('\nThis means:');
    console.log('  1. Payment was sent ✓');
    console.log('  2. Relayer delivered it ✓');
    console.log('  3. Receiver stored it ✓');
    console.log('\nThe SDK is working perfectly!');
  } else {
    console.log('❌ Still returns false');
    console.log('\nDebugging...');
    
    // Check if payment exists on receiver directly
    const receiver = (warp as any).receiver;
    try {
      const hasPaid = await receiver.hasPaid(paymentId);
      console.log(`  Direct contract check (hasPaid): ${hasPaid}`);
      
      if (hasPaid) {
        const receipt = await receiver.getReceipt(paymentId);
        console.log(`  Payment exists! Amount: ${receipt.amount}`);
        console.log('  This means SDK verify() has a bug');
      } else {
        console.log('  Payment not in receiver contract');
        console.log('  Possible reasons:');
        console.log('    - Message validation failed');
        console.log('    - Wrong contract addresses');
        console.log('    - Blockchain ID mismatch');
      }
    } catch (error: any) {
      console.log(`  Error checking: ${error.message}`);
    }
  }
}

checkLatestPayment().catch(console.error);
