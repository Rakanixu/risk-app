'use strict';

var Q = require('q');
/**
  * AI Player
  * Provides the logic for manage AI players
  */
module.exports = function() {
	var humanPlayerId = null,
		lastRegionHumanPlayer = null,
		musteringRatio = 3,
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

	// Place an army on the graph
	var placeArmy = function(userId, risk, region) {
		risk.graph[region].owner = userId;
		risk.lastRegion = region;
		if (typeof risk.graph[region].armySize === 'number') {
			risk.graph[region].armySize += 1;
		} else {
			risk.graph[region].armySize = 1;
		}

		return region;
	};

	// Checks for empty regions on the graph
	var checkEmptyRegion = function(risk) {
		for (var region in risk.graph) {
			if (!risk.graph[region].owner) return true;
		}

		return false;
	};
	
	// Execute the set up phase 
	var setUp = function(risk, userId) {
		var bestRegions = risk.graph[lastRegionHumanPlayer].link;
		
		// Place armies on the map depending on the ownership of the regions
		var setUpHelper = function(ownership) {
			var availableHotRegions = [],
				availableColdRegions = [];

			// AI players tries to set armies in regions near the human player 2 out of 3 times
			for (var i = 0; i < bestRegions.length; i++) {
				if (risk.graph[bestRegions[i]].owner === ownership && Math.floor(Math.random() * 3)) {
					return placeArmy(userId, risk, bestRegions[i]);
				}
			}
			
			// No best region available, place army on random allowed region
			for (var region in risk.graph) {
				if (risk.graph[region].owner === ownership && risk.graph[region].armySize > 2) {
					availableHotRegions.push(region);
				} else if (risk.graph[region].owner === ownership && 
						(risk.graph[region].armySize <= 3 || risk.graph[region].armySize === undefined)) {
					availableColdRegions.push(region);
				}
			}		

			// Prioritize "hot" regions over "cold" regions
			if (availableHotRegions.length > 0) {
				return placeArmy(userId, risk, availableHotRegions[Math.floor(Math.random() * (availableHotRegions.length - 1))]);
			} else {
				return placeArmy(userId, risk, availableColdRegions[Math.floor(Math.random() * (availableColdRegions.length - 1))]);
			}
		};

		if (checkEmptyRegion(risk)) {
			// Place army on empty region
			return setUpHelper(undefined);
		} else {
			// Place army on AI player regions
			return setUpHelper(userId);		
		}
	};

	// Checks for worthy attacks and returns the targets
	var checkWorthlyAttack = function(userId, risk) {
		var worthlyAttack = {
			isWorthly: false,
			fromRegion: null,
			toRegion: null
		};

		var setWorthlyAttack = function(region, toRegion) {
			worthlyAttack.isWorthly = true;
			worthlyAttack.fromRegion = region;
			worthlyAttack.toRegion = toRegion;

			return worthlyAttack;
		};

		var getBestRegions = function(regions, continent) {
			var regionsOnSameContinent = [],
				regionsOnDiferentContinent = [];

			for (var i = 0; i < regions.length; i++) {
				if (risk.graph[regions[i]].owner !== userId) {
					// Prioritize regions on the same continent 
					if (risk.graph[regions[i]].continent === continent) {
						regionsOnSameContinent.push(regions[i]);
					} else {
						regionsOnDiferentContinent.push(regions[i]);
					}
				}
			}

			// Returns the Array with the best options at the beginning
			return regionsOnSameContinent.concat(regionsOnDiferentContinent);
		};

		for (var region in risk.graph) {
			// Find a region where the AI player is the owner with a size army greater than 3 (3 attack dices available)
			if (risk.graph[region].owner === userId && risk.graph[region].armySize > 3) {
				var bestRegionsToAttack = getBestRegions(risk.graph[region].link, risk.graph[region].continent);

				for (var i = 0; i < bestRegionsToAttack.length; i++) {
					var toRegion = bestRegionsToAttack[i];

					// AI Players tries to attack human player
					if (risk.graph[bestRegionsToAttack[i]].owner === humanPlayerId) {
						return setWorthlyAttack(region, bestRegionsToAttack[i]);
					// One out of three times AI player will attack other AI players
					} else if (risk.graph[bestRegionsToAttack[i]].owner !== risk.graph[region].owner && !Math.floor(Math.random() * 3)) {
						return setWorthlyAttack(region, bestRegionsToAttack[i]);
					}					
				}
			}
		}

		return worthlyAttack;
	};
	
	// Minimum mustering is always 3, or number of region divided by 3 rounded to smallest
	var musteringPerRegions = function(risk, userId) {
		var regions = 0,
			armies = 0;
			
		for (var region in risk.graph) {
			if (risk.graph[region].owner === userId) {
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
	var musteringPerContinents = function(risk, userId) {
		var armies = 0,
			northAmerica = 0,
			southAmerica = 0,
			africa = 0,
			europe = 0,
			asia = 0,
			oceania = 0;
			
		for (var region in risk.graph) {
			if (risk.graph[region].owner === userId) {
				switch (risk.graph[region].continent) {
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
	
	// Returns the number of units to muster
	var calculateMustering = function(risk, userId) {
		return musteringPerRegions(risk, userId) + musteringPerContinents(risk, userId);
	};

	// Resolves an attack
	var getAttackResult = function(attackingDices, defendingDices) {
		var i = 0,
			length = (attackingDices.length >= defendingDices.length) ? defendingDices.length : attackingDices.length,
			losses = {
				attacker: 0,
				defender: 0
			};

		// Length is the shortest number of dices form one or another player. Number of casualties in combat
		for (i; i < length; i++) {
			if (attackingDices[i] > defendingDices[i]) {
				losses.defender++;
			} else {
				losses.attacker++;
			}
		}
		return losses;
	};
	
	// Sends the reorganization event
	var reorganization = function(socket, risk, worthlyReorganization, party, userId) {
		var regions = worthlyReorganization.fromRegion + ',' + worthlyReorganization.toRegion,
			fromRegionArmySize = risk.graph[worthlyReorganization.fromRegion].armySize,
			toRegionArmySize = risk.graph[worthlyReorganization.toRegion].armySize;

		if (risk.graph[worthlyReorganization.fromRegion].owner === userId &&
				risk.graph[worthlyReorganization.toRegion].owner === userId) {
			risk.graph[worthlyReorganization.fromRegion].armySize = 1; 
			risk.graph[worthlyReorganization.toRegion].armySize = toRegionArmySize + fromRegionArmySize - 1;
			
			socket.emit('applyMovement', null, risk.graph, regions, party);
		}
	};
	
	// Checks if there is a good reorganization movement
	var checkWorthlyReorganization = function(risk, userId) {
		var secondeNode = {
				ownsSecondNodes: false,
				fromRegion: null
			},	
			worthlyReorganization = {
			isWorthly: false,
			fromRegion: null,
			toRegion: null
		};
		
		// Returns true if all regions belongs to the given user
		var connectedRegionsOwnership = function(regions) {
			for (var i = 0; i < regions.length; i++) {
				if (risk.graph[regions[i]].owner !== userId) {
					return false;
				}
			}
			
			return true;
		};

		for (var region in risk.graph) {
			// Find a region where the AI player is the owner with a size army greater than 1 
			if (risk.graph[region].owner === userId && risk.graph[region].armySize > 1) {
				var connectedRegions = risk.graph[region].link;
				
				// Checks all surrounded regions belongs to the same AI player
				if (connectedRegionsOwnership(connectedRegions)) {
					// Iterates connected regions
					for (var i = 0; i < connectedRegions.length; i++) {
						var ownedConnectedRegions = risk.graph[connectedRegions[i]].link;
						
						// Iterates second level connected regions
						for (var j = 0; j < ownedConnectedRegions.length; j++) {

							// Checks that second level connected region belongs to another player
							if (risk.graph[ownedConnectedRegions[j]].owner !== risk.graph[connectedRegions[i]].owner) {
								worthlyReorganization.isWorthly = true;
								worthlyReorganization.fromRegion = region;
								worthlyReorganization.toRegion = connectedRegions[i];

								return worthlyReorganization;
							} else {
								secondeNode.ownsSecondNodes = true;
								secondeNode.fromRegion = region;
							}
						}
					}
				}
			}
		}
		
		// AI player controls all regions 2 position ahead the region with spare army size
		// Move the troops to another region. Next iteration enemy regions could be 2 positions ahead
		if (secondeNode.ownsSecondNodes) {
			worthlyReorganization.isWorthly = true;
			worthlyReorganization.fromRegion = secondeNode.fromRegion;
			worthlyReorganization.toRegion = risk.graph[secondeNode.fromRegion].link[0];
		}
		
		return worthlyReorganization;
	};		

	// Executes an attack
	var excuteAttack = function(socket, userId, risk, fromRegion, toRegion, party) {
		var from = risk.graph[fromRegion],
			to = risk.graph[toRegion],
			regions = fromRegion + ',' + toRegion,
			attackingQty = risk.graph[fromRegion].armySize - 1,
			attackingQtyDices = (from.armySize > 3) ? 3 : from.armySize - 1,
			defendingQtyDices = (to.armySize > 2) ? 2 : to.armySize,
			attackingDices = [],
			defendingDices = [],
			combatResult = null;

		for (var i = 0; i < attackingQtyDices; i++) {
			attackingDices.push('dice' + Math.floor((Math.random() * 6) + 1));
		}
		for (var i = 0; i < defendingQtyDices; i++) {
			defendingDices.push('dice' + Math.floor((Math.random() * 6) + 1));
		}
		attackingDices.sort();
		attackingDices.reverse();
		defendingDices.sort();
		defendingDices.reverse();

		combatResult = getAttackResult(attackingDices, defendingDices);
		if (combatResult.attacker > 0) {
			risk.graph[fromRegion].armySize -= combatResult.attacker;
		}
		if (combatResult.defender > 0) {
			risk.graph[toRegion].armySize -= combatResult.defender;

			if (risk.graph[toRegion].armySize === 0) {
				risk.graph[toRegion].owner = userId;
				risk.graph[toRegion].armySize = attackingQty - combatResult.attacker;
				risk.graph[fromRegion].armySize -= attackingQty
			}
		}

		socket.emit('applyMovement', {
				attackingDices: attackingDices,
				defendingDices: defendingDices
		}, risk.graph, regions, party);
	};

	return {
		setHumanPlayerId: function(id) {
			humanPlayerId = id;
		},
		setLastRegionHumanPlayer: function(region) {
			lastRegionHumanPlayer = region;
		},
		executeSetUp: function(risk, userId) {
			setUp(risk, userId);
		},
		executeMustering: function(socket, risk, userId) {
			var deferMustering = Q.defer(),
				musteringSize = calculateMustering(risk, userId),
				timeout = 1000,
				region = null;
				
			var singleMustering = function() {
				region = setUp(risk, userId);
				socket.emit('applyMustering', risk.graph, region);
				musteringSize--;
				
				// Set an army per second
				Q.delay(timeout).done(function() {
					// AI player had placed all its available armies
					if (musteringSize === 0) {
						deferMustering.resolve();
					// AI player has more armies to place
					} else {
						singleMustering();
					}
				});
			};				
			
			// First turn, no mustering is allowed
			if (risk.turn <= 1) {
				deferMustering.resolve();
			} else {
				singleMustering();
			}
		
			return deferMustering.promise;
		},
		executeAttackPool: function(socket, userId, risk, party) {
			var worthlyAttack = null,
				timeout = 1,
				attackPoolDefer = Q.defer();

			// Helper for manage async single attacks
			var attackHelper = function(worthlyAttack) {
				var defer = Q.defer();

				// Set a time out to execute the attack
				Q.delay(timeout).done(function() {
					// Executes a single attack
					excuteAttack(socket, userId, risk, worthlyAttack.fromRegion, worthlyAttack.toRegion, party);	

					// Checks if one more worthly attack can be done
					worthlyAttack = checkWorthlyAttack(userId, risk);
					if (worthlyAttack.isWorthly) {
						timeout = 4100;

						// Resolve recursive promises - one per attack
						attackHelper(worthlyAttack).then(function() {
							defer.resolve();
						});
					} else {
						// Resolve the promise when no more attacks can be done
						defer.resolve();
					}
				});

				return defer.promise;
			};

			// Checks if attack is worthly
			worthlyAttack = checkWorthlyAttack(userId, risk);

			// Resolves the promise after all attacks has been made
			if (worthlyAttack.isWorthly) {
				attackHelper(worthlyAttack).then(function() {
					attackPoolDefer.resolve();
				});
			// Resolves the promise if there is no available attack
			} else {
				attackPoolDefer.resolve();
			}

			return attackPoolDefer.promise;
		},
		executeReorganization: function(socket, risk, userId, party) {
			var wait = 4100,
				timeout = 1010,
				reorganizationDefer = Q.defer(),
				worthlyReorganization = null;
				
			Q.delay(wait).done(function() {
				worthlyReorganization = checkWorthlyReorganization(risk, userId);

				if (worthlyReorganization.isWorthly) {
					Q.delay(timeout).done(function() {
						reorganization(socket, risk, worthlyReorganization, party, userId);
						reorganizationDefer.resolve();
					});			
				} else {
					reorganizationDefer.resolve();
				}
			});

			return reorganizationDefer.promise;
		}
	}
};