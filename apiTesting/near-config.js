import { keyStores, KeyPair } from 'near-api-js';
import fs from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Configuration for NEAR connection
const networkId = 'testnet';
const nodeUrl = 'https://rpc.testnet.near.org';
const walletUrl = 'https://wallet.testnet.near.org';
const helperUrl = 'https://helper.testnet.near.org';
const explorerUrl = 'https://explorer.testnet.near.org';

const ACCOUNT_ID = 'habibrahman.testnet'; // NEAR account tied to the keyPair
// path to your custom keyPair location (ex. function access key for example account)
const KEY_PATH = join(homedir(), 'decentraveller', "near-credentials.json");
console.log(KEY_PATH)

const credentials = JSON.parse(fs.readFileSync(KEY_PATH, 'utf-8'));
const myKeyStore = new keyStores.InMemoryKeyStore();
myKeyStore.setKey(
  networkId,
  ACCOUNT_ID,
  KeyPair.fromString(credentials.private_key)
);

export {
  networkId,
  nodeUrl,
  walletUrl,
  helperUrl,
  explorerUrl,
  myKeyStore as keyStore,
  ACCOUNT_ID,
};