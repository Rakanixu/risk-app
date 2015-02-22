'use strict';
/**
 * Handshake service
 */
app.service('Handshake', function() {
	var handshakeConfig = {
			userId: null,
			colour: 'red',
			party: null
		},
		room = {
			roomSelector: [2, 3, 4, 5, 6],
			selectedNumPlayers: '',
			numOfPlayers: 0,
			createdByUser: false,
			currentPlayers: 0,
			createRoom: function() {
				this.createdByUser = true;
				this.numOfPlayers = this.selectedNumPlayers;
				Socket.emit('createRoom', this.numOfPlayers);
			}
		},
		roomsList = {
			list: [],
			clientInRoom: false,
			setRoomList: function(list) {
				this.list = list;
			},
			joinRoom: function(roomName) {
				this.clientInRoom = true;
				Socket.emit('joinRoom', roomName);
			}
		};

	return {
		getConfig: function() {
			return handshakeConfig;
		},
		getRoom: function() {
			return room;
		},
		getRoomsList: function () {
			return roomsList;
		},
		setConfig: function(config) {
			if (config.userId !== undefined) handshakeConfig.userId = config.userId;
			if (config.colour !== undefined) handshakeConfig.colour = config.colour;
			if (config.party !== undefined) handshakeConfig.party = config.party;
		}
	}
});