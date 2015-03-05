'use strict';
/**
 * Risk module
 * Manage game states
 */
module.exports = function(numPlayers) {
	this.graph = null;
	this.setUpArmySize = 3;//Math.round(70/numPlayers);
	this.turn = 1;
	this.lastRegion = '';
	
	this.checkWinningCondition = function(userId) {
		for (var region in this.graph) {
			if (this.graph[region].owner !== userId) {
				return false;
			} 
		}

		return true;
	};

	this.checkWipedOutPlayer = function(userId) {
		for (var region in this.graph) {
			if (this.graph[region].owner === userId) {
				return false;
			} 
		}

		return true;
	}
};
