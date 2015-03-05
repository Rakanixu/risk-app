'use strict';
/**
  * AI Player
  * Provides the logic for manage AI players
  */
module.exports = function() {
	var humanPlayerId = null,
		continents = {
			northamerica: 'northamerica',
			southamerica: 'southamerica',
			europe: 'europe',
			africa: 'africa',
			asia: 'asia',
			oceania: 'oceania'
		};

	var placeArmy = function(userId, risk, region) {
		risk.graph[region].owner = userId;
		risk.lastRegion = region;
		if (typeof risk.graph[region].armySize === 'number') {
			risk.graph[region].armySize += 1;
		} else {
			risk.graph[region].armySize = 1;
		}

		return true;
	};

	var checkEmptyRegion = function(risk) {
		for (var region in risk.graph) {
			if (!risk.graph[region].owner) return true;
		}

		return false;
	};

	var checkWorthlyAttack = function(userId, risk) {
		var worthlyAttack = {
			isWorthly: false,
			fromRegion: null,
			toRegion: null
		};

		for (var region in risk.graph) {
			// Find a region where the AI player is the owner with a size army greater than 3 (3 attack dices available)
			if (risk.graph[region].owner === userId && risk.graph[region].armySize > 1) {//!!!!DEGUG = 1, NO DEBUG = 3!!!!
				// Find a linked region where the adversay is the client
				for (var linkedRegion in risk.graph[region].link) {
					var toRegion = risk.graph[region].link[linkedRegion];

					// AI Players just attack the client
					if (risk.graph[toRegion].owner === humanPlayerId) {
						worthlyAttack.isWorthly = true;
						worthlyAttack.fromRegion = region;
						worthlyAttack.toRegion = toRegion;

						console.log('worthlyAttack', worthlyAttack);

						return worthlyAttack;
					}
				}
			}
		}

		return worthlyAttack;
	};

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

	var excuteAttack = function(userId, risk, fromRegion, toRegion) {
		var from = risk.graph[fromRegion],
			to = risk.graph[toRegion],
			attackingQty = risk.graph[fromRegion].armySize - 1,
			attackingQtyDices = (from.armySize > 3) ? 3 : from.armySize - 1,
			defendingQtyDices = (to.armySize > 2) ? 2 : to.armySize,
			attackingDices = [],
			defendingDices = [],
			combatResult = null;

		for (var i = 0; i < attackingQtyDices; i++) {
			attackingDices.push(Math.floor((Math.random() * 6) + 1));
		}
		for (var i = 0; i < defendingQtyDices; i++) {
			defendingDices.push(Math.floor((Math.random() * 6) + 1));
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

		console.log(attackingDices, defendingDices);
		console.log('from region ', risk.graph[fromRegion]);
		console.log('to region   ', risk.graph[toRegion]);
	};

	return {
		setHumanPlayerId: function(id) {
			humanPlayerId = id;
		},
		executeSetUp: function(userId, risk) {
			if (checkEmptyRegion(risk)) {
				for (var region in risk.graph) {
					// Check for a free region
					if (risk.graph[region].owner === undefined) {
						// Gives priority to regions which belongs to small continents
						if (risk.graph[region].continent === continents.southamerica) {
							return placeArmy(userId, risk, region);
						} else if (risk.graph[region].continent === continents.oceania) {
							return placeArmy(userId, risk, region);
						} else if (risk.graph[region].continent === continents.africa) {
							return placeArmy(userId, risk, region);
						} else if (risk.graph[region].continent === continents.northamerica) {
							return placeArmy(userId, risk, region);
						} else if (risk.graph[region].continent === continents.europe) {
							return placeArmy(userId, risk, region);
						} else if (risk.graph[region].continent === continents.asia) {
							return placeArmy(userId, risk, region);
						}
					}
				}
			} else {
				for (var region in risk.graph) {
					if (risk.graph[region].owner === userId) {
						return placeArmy(userId, risk, region);
					}
				}
			}

		},
		executeAttackPool: function(userId, risk) {
			var worthlyAttack = checkWorthlyAttack(userId, risk);

			// Attack until is no worthly attack
			while (worthlyAttack.isWorthly) {
				// Executes an individual attack
				excuteAttack(userId, risk, worthlyAttack.fromRegion, worthlyAttack.toRegion);
				// Checks for more worthly attacks
				worthlyAttack = checkWorthlyAttack(userId, risk);
			}
		}
	}
};