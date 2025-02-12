const FRONTEND_PORT = 5000;
const BACKEND_PORT = 3000;
HOST = window.location.hostname || 'localhost';
const API_URL = `http://${HOST}:${BACKEND_PORT}`;


const buttonSend = document.getElementById('btn-send');
const connDiv = document.getElementById('conn-status');
const msgDiv = document.getElementById('msgs');


const socket = new WebSocket(`ws://${HOST}:${BACKEND_PORT}`);
let my_uuid = null;


socket.onopen = () => {
	console.log('Connected to Server');
	connDiv.style.backgroundColor = 'green';
};

socket.onmessage = function (event) {
	const msg = JSON.parse(event.data);

	if (msg.kind === 'hi' && msg.status === 'connected') {
		my_uuid = msg.uuid;
		console.log('UUID:', my_uuid);
	}

	if (msg.kind === 'msg') {
		const newMsg = document.createElement('p');
		newMsg.innerText = msg.data;
		msgDiv.appendChild(newMsg);
	}

};

socket.onerror = function (err) {
	console.error('WebSocket Error ' + err);
}

socket.onclose = function () {
	console.log('Disconnected from Server');
	connDiv.style.backgroundColor = 'orangered';
}


// UI Event Listeners
buttonSend.addEventListener('click', () => {
	const msg = { kind: 'msg', data: 'Hello World', sender: my_uuid };
	console.log('Sending:', msg);

	if (socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(msg));
	}
});
