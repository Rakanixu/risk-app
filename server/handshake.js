'use strict';
/**
 * Handshake module
 * Manage the connection and includes the client to a room
 */
module.exports = function(io, UUID) {
	return {
		joinRoom: function(socket, rooms, roomName) {
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].roomName === roomName) {
					socket.userid = UUID();

					// Client joins a room
					socket.join(rooms[i].roomName);
					rooms[i].players.push({
						userId: socket.userid
					});
					
					socket.emit('onConnected', { 
						id: socket.userid,
						rooms: rooms.getRoomsData(),
						roomSize: rooms[i].size
					});
					io.sockets.emit('availableRooms', rooms.getRoomsData());
					console.log('User ' + socket.userid + ' joined room ' + rooms[i].roomName);

					// User waiting for more users
					socket.on('waiting', function() {
						// Emit to room member the number of people connected to the room
						io.to(rooms[i].roomName).emit('roomTotalUsers', rooms[i].players.length);
					});

					if (rooms[i].checkFullRoom()) {
						io.to(rooms[i].roomName).emit('roomTotalUsers', rooms[i].players.length);
						rooms[i].assignColours();
						setTimeout(function() {
							rooms[i].initFullRoom(rooms);
						}, 1500);
					}					
					
					// Disconnection event
					socket.on('disconnect', function() {
						// Remove user from room
						rooms[i].players.splice(rooms[i].players.indexOf(socket.userid), 1);
						io.to(rooms[i].roomName).emit('partyBroken');
						io.to(rooms[i].roomName).emit('roomTotalUsers', rooms[i].players.length);
						socket.leave(rooms[i].roomName);
						console.log('User ' + socket.userid + ' disconnected');
					});
					break;
				}
			}
		}
	}
};