import { connect, keyStores, KeyPair } from 'near-api-js';

async function nearConnection(privKey) {
	const myKeyStore = new keyStores.InMemoryKeyStore();
	const keyPair = KeyPair.fromString(privKey);
	await myKeyStore.setKey('testnet', 'habibrahman.testnet', keyPair);

	const connectionConfig = {
		networkId: 'testnet',
		keyStore: myKeyStore,
		nodeUrl: 'https://rpc.testnet.near.org',
		walletUrl: 'https://testnet.mynearwallet.com/',
		helperUrl: 'https://helper.testnet.near.org',
		explorerUrl: 'https://testnet.nearblocks.io',
	};
	const nearConnection = await connect(connectionConfig);
	return nearConnection;
}

export { nearConnection };