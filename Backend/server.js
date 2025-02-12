const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const ws = require('ws');
const crypto = require('crypto');


function getUUID() {
	return crypto.randomBytes(2).toString("hex");
}

dotenv.config({ path: './.env' });

const BACKEND_PORT = process.env.BACKEND_PORT || 3000;
const HOST = process.env.HOST || 'localhost';


const app = express();

app.use(cors({
	origin: ['localhost', '127.0.0.1']
}));

const server = http.createServer(app);
const wss = new ws.Server({ server });


// ROUTES

// Easter Egg
app.get('/', (req, res) => {
	res.redirect('/api');
});
app.get('/api', (req, res) => {
	res.json({ usage : "Even I don't know 🤷🏻"});
});

// Not Found
app.get('/*', (req, res) => {
	res.json({ error : "WRONGGG ROUTE!!!", route: req.originalUrl });
});

let clients = [];


// WEBSOCKETS
wss.on('connection', (ws) => {
	const client_uuid = getUUID();
	clients.push({ id: client_uuid, ws });

	ws.send( JSON.stringify({kind:'hi', status : 'connected', message: 'Connected to server', uuid:client_uuid}) );
	console.log(wss.clients.size + 'Connected: ' + client_uuid);


	// Event Listeners
	ws.on('message', (message) => {
		const msg = JSON.parse(message);

		if (msg.kind === 'msg') {
			console.log('GOT:', msg);

			// broadcast message to all clients
			console.log('BROADCASTING');

			wss.clients.forEach((client) => {
				// console.log('Client:', client);

				// client = client.ws;
				if ((client !== ws) && (client.readyState === WebSocket.OPEN)) {
					client.send( JSON.stringify(msg) );
				}
			});
		}
	});


	ws.on('error', (err) => {
		console.error(`WebSocket Error: ${err}`);
	});

	ws.on('close', () => {
		console.log('WebSocket Client Disconnected');
	});

});


// HTTP

server.listen(BACKEND_PORT, () => {
	console.log(`Backend @ http://${HOST}:${BACKEND_PORT}`);
});