import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { nearConnection } from './near-functions.js';
const app = express();
const port = process.env.PORT || 4000;
const googleMapsApiKey = 'AIzaSyDbzPrpnA5bpx93D9r8ZJTkE3SieROXCMg';
import axios from 'axios';

// Parses HTTP Request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection();
	const account = await connection.account(data.accountId);
});

app.post('/accountBalance', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection();
	const account = await connection.account(data.accountId);
	return await account.getAccountBalance();
});

app.post('/sendMoney', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);
	res.send(await account.sendMoney(data.receiverId, data.amount));
});


// TODO not done lol
app.post('/accountDetails', async (req, res) => {
	const data = req.body;
	const connection = await nearConnection(data.privKey, data.accountId);
	const account = await connection.account(data.accountId);
	res.send(await account.sendMoney(data.receiverId, data.amount));
});

app.get('/get-coordinates', async (req, res) => {
    const location = req.query.location;

    if (!location) {
        return res.status(400).json({ error: 'Location query parameter is required' });
    }

    try {
        const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: location,
                key: googleMapsApiKey
            }
        });

        let { results } = geocodeResponse.data;

        if (results.length === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const { lat, lng } = results[0].geometry.location;

        const elevationResponse = await axios.get('https://maps.googleapis.com/maps/api/elevation/json', {
            params: {
                locations: `${lat},${lng}`,
                key: googleMapsApiKey
            }
        });

        let elevationResults = elevationResponse.data.results;

        if (elevationResults.length === 0) {
            return res.status(404).json({ error: 'Elevation data not found' });
        }

        const elevation = elevationResults[0].elevation;

        res.json({ latitude: lat, longitude: lng, elevation: elevation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching coordinates and elevation' });
    }
});



app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

// ping endpoint
app.get('/ping', (req, res) => {
	res.send('pong');
});
