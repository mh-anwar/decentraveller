import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { nearConnection } from './near-functions.js';
const app = express();
const port = process.env.PORT || 4000;

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
	console.log(data);
	console.log(data.accountId, data.receiverId, data.amount);
	const connection = await nearConnection();
	const account = await connection.account(data.accountId);
	return await account.sendMoney(data.receiverId, data.amount);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

// ping endpoint
app.get('/ping', (req, res) => {
	res.send('pong');
});
