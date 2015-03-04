'use strict';

var UUID = require('node-uuid'),
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
			risk.graph = graph;
			risk.lastRegion = region;

			// Exclude solo player
			for (var i = 1; i < this.size - 1; i++) {
				// CLOUSURE FOR ASYNC LOOP
				// AIM --> EXECUTE every seconds, ai player after ai player
				var aiSetUp = function(i) {
					var index = i;

					return function() {
						console.log('loop', index)
						AIPlayer.executeSetUp(this.players[index].id, risk);
						socket.emit('updateGraph', risk.graph, risk.lastRegion, party);
					}.bind(this);
				};

				setTimeout(aiSetUp.bind(this)(i), 1000);



			}

			risk.setUpArmySize--;
			if (risk.setUpArmySize === 0) {
				socket.emit('setupPhaseFinished', risk.graph);
			}
		}.bind(this));
	};
};