import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { nearConnection } from './near-functions.js';
const app = express();
const port = process.env.PORT || 8080;

// Parses HTTP Request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/accountBalance');
app.get('/', async (req, res) => {
	const data = request.body;
	const connection = await nearConnection();
	const account = await connection.account(data.accountId);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
