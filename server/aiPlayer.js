'use strict';
/**
  * AI Player
  * Provides the logic for manage AI players
  */
module.exports = function() {
	var continents = {
		northamerica: 'northamerica',
		southamerica: 'southamerica',
		europe: 'europe',
		africa: 'africa',
		asia: 'asia',
		oceania: 'oceania'
	};

	var placeArmy = function(userId, risk, region) {
		risk.graph[region].owner = userId;
		risk.graph[region].armySize = 1;
		risk.lastRegion = region;
	};

	return {
		executeSetUp: function(userId, risk) {
			for (var region in risk.graph) {
				// Check for a free region
				if (risk.graph[region].owner === undefined) {
					// Gives priority to regions which belongs to small continents
					if (risk.graph[region].continent === continents.southamerica) {
						placeArmy(userId, risk, region);
					} else if (risk.graph[region].continent === continents.oceania) {
						placeArmy(userId, risk, region);
					} else if (risk.graph[region].continent === continents.africa) {
						placeArmy(userId, risk, region);
					} else if (risk.graph[region].continent === continents.northamerica) {
						placeArmy(userId, risk, region);
					} else if (risk.graph[region].continent === continents.europe) {
						placeArmy(userId, risk, region);
					} else if (risk.graph[region].continent === continents.asia) {
						placeArmy(userId, risk, region);
					}
				}
			}
		},
		executeAttack: function(userId, risk) {

		},
		checkWorthlyAttack: function(userId, risk) {

		}
	}
};