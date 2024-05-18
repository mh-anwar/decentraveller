import { connect, keyStores, KeyPair } from 'near-api-js';

const myKeyStore = new keyStores.InMemoryKeyStore();
  
const PRIVATE_KEY = "7LKryKHUzFzUdW6fhrYVsx2UTXbGw7Dj7xzMgcX6QMN6";

const keyPair = KeyPair.fromString(PRIVATE_KEY);

await myKeyStore.setKey("testnet", "habibrahman.testnet", keyPair);


const connectionConfig = {
	networkId: 'testnet',
    keyStore: myKeyStore,
	nodeUrl: 'https://rpc.testnet.near.org',
	walletUrl: 'https://testnet.mynearwallet.com/',
	helperUrl: 'https://helper.testnet.near.org',
	explorerUrl: 'https://testnet.nearblocks.io',
};

async function nearConnection() {
	const nearConnection = await connect(connectionConfig);
	return nearConnection;
}

const account = await nearConnection();

console.log(account.connection);

export { nearConnection };
// gets account details in terms of authorized apps and transactions
