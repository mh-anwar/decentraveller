import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { convertToNear, nearConnection } from './near-functions.js';
const app = express();
const port = process.env.PORT || 4000;
import axios from 'axios';
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
	console.log(account);
	const yoctoNear = await account.getAccountBalance();
	res.send(yoctoNear.total);
});

app.post('/normalAccountBalance', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);
	const yoctoNear = await account.getAccountBalance();
	console.log(convertToNear(yoctoNear.total));
	res.send(convertToNear(yoctoNear.total));
});

app.post('/sendMoney', async (req, res) => {
	const data = req.body;
	console.log(data);
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);

	res.send(await account.sendMoney(data.receiverId, data.amount));
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
		const re = await getGeocode(location);
		const { lat, lng, city, country } = re; // Add equal sign (=) after the destructuring declaration
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
		console.error(error);
		res.status(500).json({
			error: 'An error occurred while fetching data',
		});
	}
});

app.post('/gptCompletion', (req, res) => {
	const messages = req.body.messages;
	const response = gptCompletion(messages);
	res.send(response);
});

app.post('/generateImage', async (req, res) => {
	const prompt = req.body.prompt;
	const response = await generateImage(prompt);
	res.send(response);
});

app.listen(port, () => {
	console.log(`Running on port: ${port}`);
});

// ping endpoint
app.post('/ping', (req, res) => {
	const data = req.body;
	console.log(data);
	res.send('pong');
});
