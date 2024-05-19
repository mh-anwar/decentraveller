import { connect } from '@mintbase-js/auth';
import { KeyPair, InMemoryKeyStore, KeyStore } from '@mintbase-js/sdk';

import { execute, MAX_GAS, ONE_YOCTO, transfer } from '@mintbase-js/sdk';

async function mintConnection(privKey, accountId) {
	const myKeyStore = new InMemoryKeyStore();
	const keyPair = KeyPair.fromString(privKey);
	await myKeyStore.setKey('testnet', accountId, keyPair);

	const connection = await connect(accountId, myKeyStore);
	return connection;
}

// create a contact call from scratch

/* const myCustomContractCall = {
	// who should be signing the transaction
	signerId: 'mohammadanwar.testnet',
	// contract address
	contractAddress: 'submint.mohammadanwar.testnet',
	// the contract method name
	methodName: 'my_contract_method',
	// specify arguments for call_method
	args: {},
	// amount of gas to attach to the transactions
	gas: MAX_GAS,
	// the deposit to be sent along with the transaction
	deposit: ONE_YOCTO,
}; */

// create a `NearContractCall` object using a helper method:
// note how this takes care of creating all the above properties
/* const transferCall = transfer({
	nftContractId: 'mytokencontract.mintbase1.near',
	transfers: [
		{
			receiverId: 'habibrahman.testnet',
			tokenId: '123',
		},
	],
});
 */
const makeSmartContractCall = async (
	privKey,
	accountId,
	contractId,
	receiverId
) => {
	// to better understand signing options, read the auth module docs
	// to use an account directly, you have to implement this method
	// const account = await authenticateAccount('mynearaccount.near');

	// before the getWallet can be called, you will need to setup context in the browser, it will throw otherwise
	//const wallet = await getWallet();
	const account = mintConnection(privKey, accountId); // use account instead of wallet

	const options = {
		// wallet
		account,
		callbackUrl: 'localhost:4000/ping',
	};

	// call sign with options,
	return await execute(
		options,
		{
			// who should be signing the transaction
			signerId: accountId,
			// contract address
			contractAddress: 'submint.mohammadanwar.testnet',
			// the contract method name
			methodName: 'my_contract_method',
			// specify arguments for call_method
			args: {},
			// amount of gas to attach to the transactions
			gas: MAX_GAS,
			// the deposit to be sent along with the transaction
			deposit: ONE_YOCTO,
		},
		transfer({
			nftContractId: contractId,
			transfers: [
				{
					receiverId: receiverId,
					tokenId: '123',
				},
			],
		})
	);
};

export { makeSmartContractCall };
