'use strict';
/**
 * Risk service
 */
app.service('Risk', function(Handshake) {
	var armyVal = {
			soldierVal: 1,
			knightVal: 3,
			cannonVal: 5
		},
		messages = {
			setUp: 'Set up phase. ',
			waitSetUp: 'Please wait, adversaries placing army..',
			turnSetUp: 'Please place an army',
			waitPlayerTurn: 'Please wait, adversaries turn not finished..',
			playerAttackTurn: 'Attacking phase. ',
			playerMusteringTurn: function() {
				return 'Mustering phase. ' + arguments[0] + ' armies left.'
			},
			placedArmy: function() {
				return 'Adversary placed an army on ' + arguments[0];
			},
			armiesLeft: function() {
				return messages['setUp'] + arguments[0] + ' armies left.';
			},
			attack: function() {
				var args = arguments[0].split(',');
				return 'Adversary attacking from ' + args[0] + ' to ' + args[1];
			}
		},
		graph = new MapGraph(),
		allRegionsOcupied = false;

	// Checks if all regions are ocupied by any player
	var checkAllRegionsOcupied = function() {
		for (var region in graph) {
			if (graph[region].owner === undefined) {
				allRegionsOcupied = false;
				break;
			} else {
				allRegionsOcupied = true;
			}
		}
	};

	return {
		setArmy: function(region, qty) {
			var success = false;
			checkAllRegionsOcupied();
			if (!allRegionsOcupied) {
				if (graph[region].owner === undefined) {
					graph[region].owner = Handshake.getConfig().userId;
					graph[region].armySize = qty;
					success = true;
				} else {
					success = false;
				}
			} else {
				if (graph[region].owner && graph[region].owner === Handshake.getConfig().userId) {
					if (typeof graph[region].armySize === 'number') {
						graph[region].armySize += qty;
						success = true;
					} else {
						success = false;
					}
				} else if (graph[region].owner && graph[region].owner !== Handshake.getConfig().userId) {
					success = false;
				}
			}

			return success;
		},
		setGraph: function(gp) {
			if (gp) graph = gp;
		},
		getGraph: function() {
			return graph;
		},
		getArmyVal: function() {
			return armyVal;
		},
		getMessage: function(msg) {
			if (typeof messages[msg] === 'function') {				
				return messages[msg](arguments[1]);
			} else {
				return messages[msg];
			}
		},
		checkMovement: function(from, to) {
			// Checks ownership of the region and army size to decide if is an allowed movement 
			if (graph[from].link.indexOf(to) !== -1 
					&& graph[from].owner === Handshake.getConfig().userId 
					&& graph[to].owner !== Handshake.getConfig().userId 
					&& graph[from].armySize > 1) {
				return true;
			} else {
				return false;
			}
		},
		checkAllyMovement: function(from, to) {
			// Checks ownership of the region and army size to decide if is an allowed movement 
			if (graph[from].link.indexOf(to) !== -1 
					&& graph[from].owner === Handshake.getConfig().userId 
					&& graph[to].owner === Handshake.getConfig().userId 
					&& graph[from].armySize > 1) {
				return true;
			} else {
				return false;
			}		
		},		
    	initViewBind: function($scope) {
			$scope.map = {};
			// Due to performance issues, we only watch mapTriggerWatcher instead of deep 3 level map
			$scope.mapTriggerWatcher = '';
			for (var region in graph) {
				$scope.map[region] = {};
			}    	
	    }
	}
});