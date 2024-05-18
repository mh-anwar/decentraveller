import { connect, keyStores, KeyPair } from 'near-api-js';

const myKeyStore = new keyStores.InMemoryKeyStore();
  
const PRIVATE_KEY = "by8kdJoJHu7uUkKfoaLd2J2Dp1q1TigeWMG123pHdu9UREqPcshCM223kWadm";

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

console.log(await nearConnection());

export { nearConnection };
