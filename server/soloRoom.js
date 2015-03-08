'use strict';

var Q = require('q'),
	UUID = require('node-uuid'),
	Risk = require('./risk.js'),
	AIPlayer = require('./aiPlayer')();
/**
  *
  */
module.exports = function(socket, numPlayers) {
	var risk = new Risk(numPlayers);

	this.size = numPlayers;
	this.players = [];

	this.initRoom = function() {
		var colours = ['red', 'green', 'blue', 'purple', 'cyan', 'black', 'white', 'pink', 'orange'];

		// Generates an array with the players's data
		for (var i = 0; i < this.size; i++) {
			this.players.push({
				colour: colours[i], 
				id: UUID(),
				activeTurn: false
			});
		}

		socket.userid = this.players[0].id;
		AIPlayer.setHumanPlayerId(this.players[0].id);
		this.players[0].activeTurn = true;

		// Data has been initialize. Client is able to start the solo game
		socket.emit('onConnected', {
			id: this.players[0].id,
			roomSize: this.size
		});
		socket.emit('partyColours', this.players);
		socket.emit('roomTotalUsers', this.size);
		// Init set up phase
		setTimeout(function() {
			initSetUp.call(this);
		}.bind(this), 2500);
	};

	var initSetUp = function() {
		socket.emit('turnSetupStarted', risk.graph, risk.lastRegion, risk.setUpArmySize);
		socket.on('turnSetupFinished', function(graph, region, party) {
			var timeout = 1000;

			// Closure for async loop
			var aiSetUp = function(i) {
				var index = i;

				return function() {
					AIPlayer.executeSetUp(risk, this.players[index].id);
					updatePartyTurn(party);
					socket.emit('updateGraph', risk.graph, risk.lastRegion, party);

					// After all AI players had their turn
					if (index === this.size - 1) {
						risk.setUpArmySize--;
						if (risk.setUpArmySize === 0) {
							// Setup phase finished, start game phase
							socket.emit('setupPhaseFinished', risk.graph);
							initGame.call(this, party);
						} else {
							// Player receives the turn 500ms after the last AI player made an action
							setTimeout(function() {
								socket.emit('turnSetupStarted', risk.graph, risk.lastRegion, risk.setUpArmySize);
							}, 500);
						}
					}
				}.bind(this);
			};

			risk.graph = graph;
			risk.lastRegion = region;
			AIPlayer.setLastRegionHumanPlayer(region);

			updatePartyTurn(party);
			socket.emit('updateGraph', risk.graph, risk.lastRegion, party);

			// Exclude solo player
			for (var i = 1; i < this.size; i++) {
				// Initialize the outer method with the iterator in memory
				// Inner method will be trigger by the setTimeout
				setTimeout(aiSetUp.bind(this)(i), timeout);
				timeout += 1000;
			}
		}.bind(this));
	};

	var initGame = function(party) {
		socket.emit('turnStarted', risk.turn);

		socket.on('applyMovementToParty', function(dicesResult, graph, regions, party, userId) {
			risk.graph = graph;
			
			// Sets the last region human player has attacked as "hot" region
			// AI players will try to muster around this node and its linked nodes
			AIPlayer.setLastRegionHumanPlayer(regions.split(',')[1]);

			// Checks if attacked AI player lost all his regions
			if (risk.graph[regions.split(',')[1]].owner === userId) {
				for (var i = 1; i < this.players.length; i++) {
					if (this.players[i].id !== userId && risk.checkWipedOutPlayer(this.players[i].id)) {
						// Sends loser event and remove user from room
						this.players.splice(i, 1);
						party.splice(i, 1);
						this.size--;
						socket.emit('updateParty', party);
						break;
					}
				}
			}
		}.bind(this));

		// Client finished his turn
		socket.on('turnFinished', function(party, userId) {
			var index = 1,
				timeout = 100;
			
			// Perform all AI player's attacks
			var aiPlayerHelper = function() {
				// Executes mustering phase
				// Once the muster phase had finished, attacking phase begin
				AIPlayer.executeMustering(socket, risk, this.players[index].id).then(function() {
					// Returns a promise allowing chaining all async operations
					return AIPlayer.executeAttackPool(socket, this.players[index].id, risk, party);
				// Once attacking phase had finished, reorganization phase begin
				}.bind(this)).then(function() {
					return AIPlayer.executeReorganization(socket, risk, this.players[index].id, party);
				// Once reorganization phase had finished, check losing conditions and call next AI player's actions					
				}.bind(this)).then(function() {
					Q.delay(timeout).done(function() {
						index++;
						
						updatePartyTurn(party);
						socket.emit('updateParty', party);
						
						// Checks after each AI player's turn if client has been wiped out
						if (risk.checkWipedOutPlayer(userId)) {
							socket.emit('losser');
							return;
						}

						if (index < this.size) {
							// Recursive calls until all AI players had their turn
							aiPlayerHelper();
						} else {
							Q.delay(timeout).done(function() {
								risk.turn++;
								socket.emit('turnStarted', risk.turn);
							});
						}
					}.bind(this));				
				}.bind(this));
			}.bind(this);
			
			// Check for winning condition at the end of player´s turn
			if (risk.checkWinningCondition(userId)) {
				socket.emit('winner');
				return;
			}
			
			updatePartyTurn(party);
			socket.emit('updateParty', party);
			
			// Executes the attack helper
			aiPlayerHelper();
								
		}.bind(this));
	};

	var updatePartyTurn = function(party) {
		// Last client had the turn, pass to the first one
		if (party[party.length - 1].activeTurn) {
			party[0].activeTurn = true;
			party[party.length - 1].activeTurn = false;
		} else {
			for (var i = 0; i < party.length; i++) {
				if (party[i].activeTurn) {
					party[i + 1].activeTurn = true;
					party[i].activeTurn = false;
					break;
				}
			}
		}
	};
};