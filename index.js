import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { spawn } from 'child_process';
import { convertToNear, nearConnection } from './near-functions.js';
import crypto from 'crypto';
const app = express();
const port = process.env.PORT || 4000;

import {
	gptCompletion,
	getElevation,
	getGeocode,
	getNearbyPlaces,
	getPlaceDetails,
	generateImage,
} from './gptApi.js';

// Parses HTTP Request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
	/* 
	const data = req.body;
	const connection = await nearConnection();
	const account = await connection.account(data.accountId); */
	res.send('Hello World');
});

app.post('/accountBalance', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);
	const yoctoNear = await account.getAccountBalance();
	res.send(yoctoNear.total);
});

app.post('/normalAccountBalance', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);
	const yoctoNear = await account.getAccountBalance();
	res.send(convertToNear(yoctoNear.total));
});

app.post('/sendMoney', async (req, res) => {
	const data = req.body.Value;
	console.log(data);

	const connection = await nearConnection(
		data.privKey.Value,
		data.accountId.Value
	);
	console.log('made connection: ' + connection);
	const account = await connection.account(data.accountId.Value);
	console.log('made account: ' + account);
	res.send(await account.sendMoney(data.receiverId.Value, data.amount.Value));
});

app.post('/accountDetails', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);
	res.send(await account.state());
});

/*
give location, 
get coordinates and elevation
*/
app.get('/get-coordinates', async (req, res) => {
	const location = req.query.location;

	if (!location) {
		return res
			.status(400)
			.json({ error: 'Location query parameter is required' });
	}

	try {
		const { lat, lng, city, country } = await getGeocode(location);
		const elevation = await getElevation(lat, lng);
		// const nearbyPlaces = await getNearbyPlaces(lat, lng);
		// const detailedPlaces = await getPlaceDetails(nearbyPlaces, lat, lng);

		res.json({
			latitude: lat,
			longitude: lng,
			elevation: elevation,
			city: city,
			country: country,
			// nearbyPlaces: detailedPlaces
		});
	} catch (error) {
		res.status(500).json({
			error: 'An error occurred while fetching data',
		});
	}
});

app.post('/gptCompletion', async (req, res) => {
	console.log(req.body);
	const inputJson = req.body.Value.messages;

	function extractMessages(json) {
		return json.Value.map((item) => ({
			role: item.Value.role.Value,
			content: item.Value.message.Value,
		}));
	}

	const messages = extractMessages(inputJson);
	const response = await gptCompletion(messages);
	console.log('Our response is: ' + JSON.stringify(response));
	res.send(response);
});

app.post('/generateImage', async (req, res) => {
	const prompt = req.body.prompt;
	const response = await generateImage(prompt);
	res.send(response);
});

app.post('/mintNft', async (req, res) => {
	const data = req.body;
	const accountId = data.accountId;
	const tokenId = crypto.createHash('sha256');
	tokenId.update(data.title);
	const token = tokenId.digest('hex');
	const title = data.title;
	const media = data.media;
	console.log(`./mint.sh ${accountId} ${token} ${title} ${media}`);
	/* exec(
		`./mint.sh ${accountId} ${token} ${title} ${media}`,
		(error, stdout, stderr) => {
			if (error) {
				console.error(`Error executing script: ${error.message}`);
				res.send({ status: 'error' });
			}

			if (stderr) {
				console.error(`Script stderr: ${stderr}`);
				res.send({ status: 'error' });
			}

			console.log(`Script output: ${stdout}`);
			res.send({ status: 'success' });
		}
	); */

	const mintProcess = spawn('./mint.sh', [accountId, token, title, media]);

	mintProcess.stdout.on('data', (data) => {
		// console.log(`Script output: ${data}`);
		// Check for the confirmation request in the stdout
		if (
			data.toString().includes('account already has a deployed contract')
		) {
			mintProcess.stdin.write('y\n');
		}
	});

	mintProcess.stderr.on('data', (data) => {
		console.error(`Script stderr: ${data}`);
		res.send({ status: 'error' });
	});

	mintProcess.on('close', (code) => {
		if (code !== 0) {
			console.error(`Script exited with code ${code}`);
			res.send({ status: 'error' });
		} else {
			res.send({ status: 'success' });
		}
	});
});

app.listen(port, () => {
	console.log(`Running on port: ${port}`);
});

// ping endpoint
app.post('/ping', (req, res) => {
	const data = req.body;
	res.send('pong');
});
