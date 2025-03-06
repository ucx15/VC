const FRONTEND_PORT = 5000;
const BACKEND_PORT = 3000;
HOST = window.location.hostname || 'localhost';
const API_URL = `http://${HOST}:${BACKEND_PORT}`;


const connDiv = document.getElementById('conn-status');
const startButton = document.getElementById('start-button');
let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const otherCanvas = document.getElementById("other-canvas");
const otherContext = otherCanvas.getContext("2d");


const width = 320;
const height = 240;
let streaming = false;
const socket = new WebSocket(`ws://${HOST}:${BACKEND_PORT}`);
let my_uuid = null;
let transfering = false;

function getVideoFrame() {
	const context = canvas.getContext("2d");
	context.drawImage(video, 0, 0, width, height);
	return canvas.toDataURL("image/png");
}

try {

	navigator.mediaDevices
		.getUserMedia({
			video: true,
			audio: false
		})
		.then((stream) => {
			video.srcObject = stream;
			video.play();
		})
		.catch((err) => {
			console.error(`An error occurred: ${err}`);
		});
}
catch (err) {
	console.error('Error:', err);
}


video.addEventListener(
	"canplay",
	(ev) => {
		if (!streaming) {
			video.setAttribute("width", width);
			video.setAttribute("height", height);

			canvas.setAttribute("width", width);
			canvas.setAttribute("height", height);

			streaming = true;
		}
	},
	false,
);


socket.onopen = () => {
	console.log('Connected to Server');
	connDiv.style.backgroundColor = 'green';
};

socket.onmessage = function (event) {
	const msg = JSON.parse(event.data);

	if (msg.kind !== 'img') {
		console.log('Received:', msg);
	}

	if (msg.kind === 'hi' && msg.status === 'connected') {
		my_uuid = msg.uuid;
		console.log('UUID:', my_uuid);
	}

	else if (msg.kind === 'msg') {
		const newMsg = document.createElement('p');
		newMsg.innerText = msg.data;
		msgDiv.appendChild(newMsg);
	}

	else if (msg.kind === 'img') {
		fetch(msg.data)
			.then(res => res.blob())
			.then(blob => createImageBitmap(blob))
			.then(imageBitmap => {
				otherCanvas.width = width;
				otherCanvas.height = height;
				otherContext.drawImage(imageBitmap, 0, 0); // Draw the captured image
			})
			.catch(err => console.error("Error drawing image:", err));
		// const newMsg = document.createElement('p');
		// newMsg.innerText = msg.data;
		// msgDiv.appendChild(newMsg);
	}
};

socket.onerror = function (err) {
	console.error('WebSocket Error ' + err);
}

socket.onclose = function () {
	console.log('Disconnected from Server');
	connDiv.style.backgroundColor = 'orangered';
}


function sendFrameData() {
	const data = getVideoFrame();

	const msg = { kind: 'img', data, sender: my_uuid };
	if (socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify(msg));
	}
}


setInterval(() => {
	if (transfering && (socket.readyState === WebSocket.OPEN)) {
		sendFrameData();
	}
}, 1000 / 24);


// UI Event Listeners
startButton.addEventListener('click', (ev) => {
	transfering = !transfering;
	// ev.preventDefault();
	// sendFrameData();
});
