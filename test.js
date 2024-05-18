import { connect, utils } from 'near-api-js';
import * as config from './near-config.js'; 
const RECEIVER_ID = 'mohammadanwar.testnet';
const AMOUNT = utils.format.parseNearAmount('1'); // Convert 1 NEAR to yoctoNEAR

async function main() {
  // Connect to the NEAR network
  const near = await connect({
    networkId: config.networkId,
    nodeUrl: config.nodeUrl,
    walletUrl: config.walletUrl,
    helperUrl: config.helperUrl,
    explorerUrl: config.explorerUrl,
    keyStore: config.keyStore,
  });

  const account = await near.account(config.ACCOUNT_ID);
  console.log('Account:', account);

  // Send money
  const result = await account.sendMoney(RECEIVER_ID, AMOUNT); // Sending 1 NEAR
  console.log('Transaction Result:', result);
}

main().catch(console.error);