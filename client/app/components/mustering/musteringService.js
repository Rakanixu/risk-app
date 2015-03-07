'use strict';
/**
 * Mustering service
 */
app.service('Mustering', function(Handshake, Risk) {
	var musteringRatio = 3,
		continents = {
			northamerica: {
				name: 'northamerica',
				regions: 9,
				armies:5
			},
			southamerica: {
				name: 'southamerica',
				regions: 4,
				armies: 2
			},
			africa: {
				name: 'africa',
				regions: 6,
				armies: 3
			},
			europe: {
				name: 'europe',
				regions: 7,
				armies: 5
			},
			asia: {
				name: 'asia',
				regions: 12,
				armies: 7
			},
			oceania: {
				name: 'oceania',
				regions: 4,
				armies: 2
			}
		};
	
	// Minimum mustering is always 3, or number of region divided by 3 rounded to smallest
	var musteringPerRegions = function() {
		var graph = Risk.getGraph(),
			regions = 0,
			armies = 0;
			
		for (var region in graph) {
			if (graph[region].owner === Handshake.getConfig().userId) {
				regions++;
			}
		}
		armies = Math.floor(regions/musteringRatio);
		if (armies > 3) {
			return armies;
		} else {
			return musteringRatio;
		}
	};
	
	// Mustering per continents if player controls the whole continent at the beginning of his turn
	var musteringPerContinents = function() {
		var graph = Risk.getGraph(),
			armies = 0,
			northAmerica = 0,
			southAmerica = 0,
			africa = 0,
			europe = 0,
			asia = 0,
			oceania = 0;
			
		for (var region in graph) {
			if (graph[region].owner === Handshake.getConfig().userId) {
				switch (graph[region].continent) {
					case continents.northamerica.name:
						northAmerica++;
						break;
					case continents.southamerica.name:
						southAmerica++;
						break;
					case continents.africa.name:
						africa++;
						break;
					case continents.europe.name:
						europe++;
						break;
					case continents.asia.name:
						asia++;
						break;
					case continents.oceania.name:
						oceania++;
						break;						
				}
			}
		}

		if (northAmerica === continents.northamerica.regions) {
			armies += continents.northamerica.armies;
		}
		if (southAmerica === continents.southamerica.regions) {
			armies += continents.southamerica.armies;
		}
		if (africa === continents.africa.regions) {
			armies += continents.africa.armies;
		}
		if (europe === continents.europe.regions) {
			armies += continents.europe.armies;
		}
		if (asia === continents.asia.regions) {
			armies += continents.asia.armies;
		}
		if (oceania === continents.oceania.regions) {
			armies += continents.oceania.armies;
		}
		
		return armies;
	};
	
	return {
		calculateMustering: function() {
			return musteringPerRegions() + musteringPerContinents();
		}
	}
});