import { Warp402Factory } from 'avax-warp-pay';

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

async function check() {
  const warp = Warp402Factory.fromExisting(config);
  
  // Payment from quickstart
  const paymentId = 'de6aa122d1d66e7a540a90431e70d5cc4a5b524a58616aad3257cec16996d2ea';
  
  console.log('Checking quickstart payment...');
  console.log(`Payment ID: ${paymentId}\n`);
  
  const verified = await warp.verify(paymentId);
  console.log(`Verified: ${verified}`);
  
  if (verified) {
    console.log('\n✅ SUCCESS! The payment was cross-chain verified!');
  } else {
    console.log('\n❌ Not verified yet');
  }
}

check().catch(console.error);
