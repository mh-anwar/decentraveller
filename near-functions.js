import { connect } from 'near-api-js';

const connectionConfig = {
	networkId: 'testnet' /* 
	keyStore: myKeyStore, // first create a key store */, // skip signing transactions for now
	nodeUrl: 'https://rpc.testnet.near.org',
	walletUrl: 'https://testnet.mynearwallet.com/',
	helperUrl: 'https://helper.testnet.near.org',
	explorerUrl: 'https://testnet.nearblocks.io',
};

async function nearConnection() {
	const nearConnection = await connect(connectionConfig);
	return nearConnection;
}

export { nearConnection };
