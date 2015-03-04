'use strict';

var port = process.env.PORT || 80,
    app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    UUID = require('node-uuid'),
    Handshake = require('./server/handshake.js')(io, UUID),
    Room = require('./server/room.js'),
    SoloRoom = require('./server/soloRoom.js'),
    rooms = [];

/**
  * Server listens on port
  */
server.listen(port);

/**
  * Router redirects GET requests to index.html
  */
app.get('/', function(req, res) { 
	res.sendFile(__dirname + '/client/index.html');
}); 

/**
  * Router redirects GET requests to the file requested
  */
app.get('/*', function(req, res) {
	var file = req.params[0]; 

	// Send the requested file
	res.sendFile(__dirname + '/' + file);
});

/**
  * socket.io connection event
  */
io.on('connection', function(socket) {
	// On firefox, Socket.on initialization happens after server sent events
	// Waiting some time ensures client has been initialize properly and it's listening to events
	setTimeout(function() {
		io.sockets.emit('availableRooms', rooms.getRoomsData());
		socket.on('createRoom', function(numPlayers) {
			rooms.push(new Room(io, UUID(), numPlayers, rooms));
			io.sockets.emit('availableRooms', rooms.getRoomsData());
		});

		socket.on('joinRoom', function(roomName) {
			Handshake.joinRoom(this, rooms, roomName);
		});

		socket.on('createSoloRoom', function(numPlayers) {
			var soloRoom = new SoloRoom(socket, numPlayers);

			soloRoom.initRoom();
		});
	}, 1000);
});

/**
  * Utils
  */
Array.prototype.getRoomsData = function() {
	var roomsInfo = [];

	for (var i = 0; i < this.length; i++) {
		roomsInfo[i] = {
			size: this[i].size,
			players: this[i].players,
			roomName: this[i].roomName
		};
	}
	return roomsInfo;
};

