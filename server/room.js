'use strict';
/**
 * Room module
 */
module.exports = function(io, roomName, numPlayers, rooms) {
	var Risk = require('./risk.js'),
		risk = new Risk(),
		turn = 1;

	this.roomName = roomName;
	this.size = (typeof numPlayers === 'number') ? numPlayers : 3;
	this.players = [];
	this.clientSockets = [];

	var resetSocketsRoom = function() {
		this.clientSockets = [];
		risk = new Risk();
	};

	var emptyRoom = function() {
		var roomClients = io.sockets.adapter.rooms[this.roomName];

		this.players = [];
		for (var clientId in roomClients) {
			io.sockets.connected[clientId].leave(this.roomName);
			io.sockets.connected[clientId].removeAllListeners();
		}

		// Remove room from pool
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].roomName === this.roomName) {
				rooms.splice(i, 1);
				break;
			}
		}
	};

	this.checkFullRoom = function() {
		if (this.players.length === this.size) {
			return true;
		} else {
			return false;
		}
	};

	this.assignColours = function() {
		var roomClients = io.sockets.adapter.rooms[this.roomName],
			colours = ['green', 'cyan', 'orange', 'blue', 'white', 'pink', 'purple'],
			party = [];

			for (var i = 0; i < this.size; i++) {
				party.push({
					colour: colours[i], 
					id: this.players[i].userId
				});
			}
			
		// Sends the colours and the players (Ids) to all clients.
		// Client will manage how to asign colours to the oponents
		io.to(this.roomName).emit('partyColours', party);
	};

	this.initFullRoom = function() {
		var roomClients = io.sockets.adapter.rooms[this.roomName],
			listenerActive = [],
			turnToken = 0,
			initializeFirstTurn = false;
	
		var initGame = function() {
			this.clientSockets[turnToken].emit('turnStarted', risk.turn);
			this.clientSockets[turnToken].on('applyMovementToParty', function(graph, regions, userId) {
				risk.graph = graph;

				// Sends data to update on other clients with last attack
				for (var i = 0; i < this.clientSockets.length; i++) {
					if (i !== turnToken) {
						this.clientSockets[i].emit('applyMovement', risk.graph, regions);
					}
				}
				
				// Attacker conquest the region
				// Checks if attacked player lost all his regions
				if (risk.graph[regions.split(',')[1]].owner === userId) {
					for (var i = 0; i < this.players.length; i++) {
						if (this.players[i].userId !== userId && risk.checkWipedOutPlayer(this.players[i].userId)) {
							// Sends losser event and remove user from room
							this.clientSockets[i].emit('losser');
							this.clientSockets[i].leave(this.roomName);
							this.clientSockets[i].removeAllListeners();
							this.clientSockets.splice(i, 1);
							this.players.splice(i, 1);
							this.size--;

							for (var i = 0; i < this.players.length; i++) {
								if (this.players[i].userId === userId) {
									// turnToken is equals to the position of the user with the turn
									// On turnFinished event will be increase for give the turn to next user
									turnToken = i;
									break;
								}
							}
							break;
						}
					}
				}
			}.bind(this));

			// Mustering event
			this.clientSockets[turnToken].on('mustering', function(graph, region) {
				risk.graph = graph;
				// Sends data to update on other clients with last attack
				for (var i = 0; i < this.clientSockets.length; i++) {
					if (i !== turnToken) {
						this.clientSockets[i].emit('applyMustering', risk.graph, region);
					}
				}				
			}.bind(this));

			// Client finished his turn
			this.clientSockets[turnToken].on('turnFinished', function(userId) {
				// After finish its turn, check if player won the match
				if (risk.checkWinningCondition(userId)) {
					this.clientSockets[turnToken % this.size].emit('winner');
					for (var i = 0; i < this.clientSockets.length; i++) {
						if (i !== turnToken % this.size) {
							this.clientSockets[i].emit('losser');
						}
					}	
					emptyRoom.call(this);
					return;
				}
				turnToken++;
				// A client finish its turn, calling it for next client
				// Every time a player is wiped out, turnToken would be lesser than the number of players
				// initializeFirstTurn is used to be sure any more listeners are initialize in that case.
				if (turnToken < this.clientSockets.length && !initializeFirstTurn) {
					initGame.call(this);
				} else {
					initializeFirstTurn = true;
					// turnToken is being increase for every turn for every player.
					// On that way we assign the turn for the desired player. 
					// At this point server just listen to events and respond acordingly
					if (turnToken % this.size === 0) {
						// The turn is increased when all players had the turn 
						risk.turn++;
					}

					this.clientSockets[turnToken % this.size].emit('turnStarted', risk.turn);
				}
			}.bind(this));
		};

		// Every time this method is called, it is call via .bind or .call to have the own object scope into the sockets event scope
		var initSetUp = function() {	
			// Sends to player who owns the turn
			this.clientSockets[turnToken].emit('turnSetupStarted', risk.graph, risk.lastRegion, risk.setUpArmySize);	
			if (!listenerActive[turnToken]) {
				// Listens player who owns the turn on turnFinished once
				this.clientSockets[turnToken].on('turnSetupFinished', function(graph, region) {
					risk.graph = graph;
					risk.lastRegion = region;
					// Sends updated data to all players in the room except the one who perform the action
					for (var i = 0; i < this.clientSockets.length; i++) {
						if (i !== turnToken) {
							this.clientSockets[i].emit('updateGraph', risk.graph, risk.lastRegion);
						}
					}
					turnToken++;

					// Allows dinamic number  of players
					if (turnToken < this.clientSockets.length) {
						// Same turn, another player
						initSetUp.call(this);
					} else {
						// Turn has finished for all players. Checks if setup phase has finished
						turnToken = 0;
						risk.setUpArmySize--;

						// Checks if all players setup their armies
						if (risk.setUpArmySize > 0) {
							// Sends to first player is his turn if deployment has not finished
							initSetUp.call(this);
						} else {
							// Sends to room members setup phase has finished
							io.to(this.roomName).emit('setupPhaseFinished', risk.graph);
							initGame.call(this);
						}
					}
				}.bind(this));
				listenerActive[turnToken] = true;
			}
		};
		
		var initChat = function() {
			for (var i = 0; i < this.clientSockets.length; i++) {
				this.clientSockets[i].on('partyMessage', function(msg, userId) {
					io.to(this.roomName).emit('broadcastedPartyMessage', msg, userId);
				}.bind(this));			
			}
		};

		// Reset sockets every time the room is initialize
		resetSocketsRoom.call(this);
		for (var clientId in roomClients) {
			// Stores the client sockets of the room
		    this.clientSockets.push(io.sockets.connected[clientId]);
		    listenerActive.push(false);
		}
		
		// Initialize room chat
		initChat.call(this);
		// Setup begins
		initSetUp.call(this);
	};

	return this;
};