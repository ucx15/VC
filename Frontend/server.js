const express = require('express');
const path = require('path');
const dotenv = require('dotenv');


dotenv.config({ path: './.env' });

const FORNTEND_PORT = process.env.FRONTEND_PORT || 5001;
const HOST = process.env.HOST || 'localhost';

const app = express();


app.use(express.static('public'));


app.listen(FORNTEND_PORT, () => {
	console.log(`Frontend @ http://${HOST}:${FORNTEND_PORT}`);
});
