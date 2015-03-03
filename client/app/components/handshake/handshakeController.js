'use strict';
/**
 *  Handshake controller
 */
app.controller('HandshakeController', function($scope, $location, $timeout, $window, Handshake) {
	$scope.room = Handshake.getRoom();
	$scope.roomsList = Handshake.getRoomsList();

	/**
	  * onConnected event. Client receives userId assign by server.
	  */
	Socket.on('onConnected', function(init) {
		Handshake.getRoomsList().setRoomList(init.rooms);
		Handshake.getRoom().numOfPlayers = init.roomSize;
		Handshake.setConfig({
			userId: init.id
		});

		$scope.$apply();

		//Let the server know user is waiting
		Socket.emit('waiting');
	});

	/**
	  * availableRooms event. Server sends the available rooms to join.
	  */
	Socket.on('availableRooms', function(rooms) {
		Handshake.getRoomsList().setRoomList(rooms);
		$scope.$apply();
	});

	/**
	  * playerColour event. Server assigns different colours for every player.
	  */
	Socket.on('partyColours', function(party) {
		// Removes the data of the own player. Stores adversaries data.
		for (var i = 0; i < party.length; i++) {
			if (party[i].id === Handshake.getConfig().userId) {
				// Assigns default colour for player
				party[i].colour = Handshake.getConfig().colour;
			}
		}

		Handshake.setConfig({
			party: party
		});
	});

	/**
	  * roomTotalUsers event. 
	  * Client receives number of people in its room, and calculates missing players
	  * Client updates view
	  */
	Socket.on('roomTotalUsers', function(usersInRoom) {
		Handshake.getRoom().currentPlayers = usersInRoom;

		if (Handshake.getRoom().numOfPlayers - Handshake.getRoom().currentPlayers === 0) {
			// Full room - route to risk component
			$location.path('/risk/setup');
		}
		// Apply view and route if neccesary
		$scope.$apply();
	});

	/**
	  * partyBroken event - user left the room
	  * Resets game due to user left room
	  */
	Socket.on('partyBroken', function() {
		$timeout(function() {
			//if redirects to root path, the client connection is maintained
			//$location.path('/');
			// Force a hard reset by closing current socket and connecting to server again
			// Angular app is reseted completly 
			$window.location.href = '/';
		}, 0);
	});	
});