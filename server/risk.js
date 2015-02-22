'use strict';
/**
 * Risk module
 * Manage game states
 */
module.exports = function() {
	this.graph = null;
	this.setUpArmySize = 22;
	this.turn = 1;
	this.lastRegion = '';

	this.checkWinningCondition = function(userId) {
		var winner = true;

		for (var region in this.graph) {
			if (this.graph[region].owner !== userId) {
				winner = false;
				break;
			} 
		}

		return winner;
	};
};
