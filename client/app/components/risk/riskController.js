'use strict';
/**
 *  Game controller
 */
app.controller('RiskController', function($scope, $timeout, $window, Handshake, Risk, Mustering, blockUI, ngDialog) {
	var regionStack = [],
		attackingQty = 0,
		moveQty = 0,
		mustering = false,
		reoganization = false,
		myBlockUI = blockUI.instances.get('myBlockUI');

	// Block the user interface
    myBlockUI.start('Wait for other players');
	Risk.initViewBind($scope);
	$scope.turn = '1';
	$scope.waitMessage = Risk.getMessage('waitPlayerTurn');
	$scope.lastAction = '';
	$scope.initGame = true;
	$scope.turnActive = false;
	$scope.showDicesResult = false;
	$scope.party = Handshake.getConfig().party;

	/**
	 * Server asign to client its turn
	 */
	Socket.on('turnStarted', function(turn) {
		$scope.$apply(function() {
			myBlockUI.stop();
			$scope.turnActive = true;
			if (turn) $scope.turn = turn;
		
			if (turn > 1) {
				var armies = Mustering.calculateMustering();
				
				mustering = true;
				$scope.waitMessage = Risk.getMessage('playerMusteringTurn', armies);
				$scope.musteringArmies = armies;
				ngDialog.open({ 
					template: 'client/app/components/errorDialogs/mustering.html',
					scope: $scope,
					overlay: false,
					closeByDocument: false,
					closeByEscape: false,
					showClose: false
				});
			} else {
				mustering = false;
				$scope.waitMessage = Risk.getMessage('playerAttackTurn');
			}
		});
	});
	
	/**
	 * Server sent the data (mustering) from the active client
	 */	
	Socket.on('applyMustering', function(graph, region){
		Risk.setGraph(graph);
		$scope.$apply(function() {
			$scope.lastAction = Risk.getMessage('placedArmy', region);
			$scope.mapTriggerWatcher = region;
		});
	});
	
	/**
	 * Server sent the data (last movement) from the active client
	 */	
	Socket.on('applyMovement', function(dicesResult, graph, regions, party) {
		var region1 = regions.split(',')[0],
			region2 = regions.split(',')[1],
			dialogInstance = null;

		Risk.setGraph(graph);
		Handshake.setConfig({
			party: party
		});

		$scope.$apply(function() {
			$scope.party = Handshake.getConfig().party;
			// Shows the dices result pop up to all players 
			// If there is no dice info available, that means last movement was a reorganization
			if (dicesResult) {
				$scope.showDicesResult = true;
				$scope.viewAction = Risk.getViewActions().attack;
				$scope.reg1 = region1;
				$scope.reg2 = region2;
				$scope.attackingDices = dicesResult.attackingDices;
				$scope.defendingDices = dicesResult.defendingDices;
				dialogInstance = ngDialog.open({ 
					template: 'client/app/components/errorDialogs/diceResult.html',
					scope: $scope,
					overlay: false,
					closeByDocument: false,
					closeByEscape: false,
					showClose: false
				});
			} else {
				// Reorganization icon on the affected regions is shown 
				$scope.viewAction = Risk.getViewActions().reorganization;
			}

			$scope.updateRegionFrom = region1;
			$scope.updateRegionTo = region2;
			// Result is shown for 4 sec. 
			$timeout(function() {
				dialogInstance.close();
				$scope.updateRegionFrom = null;
				$scope.updateRegionTo = null;
				$scope.showDicesResult = false;
			}, 4000);
			$scope.lastAction = Risk.getMessage('attack', regions);
			$scope.mapTriggerWatcher = regions;
		});
	});

	/**
	 * Update party event to notice the custom turn
	 */	
	Socket.on('updateParty', function(party) {
		Handshake.setConfig({
			party: party
		});

		$scope.$apply(function() {
			$scope.party = Handshake.getConfig().party;
		});
	});

	/**
	 * Server sent event to notice client has won the game
	 */	
	Socket.on('winner', function() {
		$scope.$apply(function() {
			myBlockUI.stop();
			ngDialog.open({ 
				template: 'client/app/components/errorDialogs/winner.html',
				scope: $scope,
				overlay: false,
				closeByDocument: false,
				closeByEscape: false,
				showClose: false
			});
		});
	});	

	/**
	 * Server sent event to notice client has lost the game
	 */	
	Socket.on('losser', function() {
		$scope.$apply(function() {
			myBlockUI.stop();
			ngDialog.open({ 
				template: 'client/app/components/errorDialogs/losser.html',
				scope: $scope,
				overlay: false,
				closeByDocument: false,
				closeByEscape: false,
				showClose: false
			});
		});
	});		

	// Shows dialog to confirm attack
	var applyMovement = function(reg1, reg2) {
		$scope.reg1 = reg1;
		$scope.reg2 = reg2;
		$scope.attackWith = [];
		for (var i = 0; i < Risk.getGraph()[reg1].armySize - 1; i++) {
			$scope.attackWith[i] = {
				display: (i + 1).toString(),
				value: i + 1
			};
		};

		ngDialog.open({ 
			template: 'client/app/components/errorDialogs/attack.html',
			scope: $scope,
			overlay: false,
			closeByDocument: false,
			closeByEscape: false,
			showClose: false
		});
	};
	
	// Shows dialog to confirm reorganization movement
	var applyReorganizationMovement = function(reg1, reg2) {
		$scope.reg1 = reg1;
		$scope.reg2 = reg2;	
		$scope.moveWith = [];
		for (var i = 0; i < Risk.getGraph()[reg1].armySize - 1; i++) {
			$scope.moveWith[i] = {
				display: (i + 1).toString(),
				value: i + 1
			};
		};
		
		ngDialog.open({ 
			template: 'client/app/components/errorDialogs/reorganizeArmy.html',
			scope: $scope,
			overlay: false,
			closeByDocument: false,
			closeByEscape: false,
			showClose: false
		});
	};

	/**
	 * Sets number of soldiers attacking another region
	 */
	$scope.onchange = function(item) {
		attackingQty = item.value;
	};
	
	$scope.onchangeReorganization = function(item) {
		moveQty = item.value;
	};

	/**
	 * Manage an attack
	 */
	$scope.resolveAttack = function() {
		var i,
			combatResult = {},
			region1 = $scope.reg1,
			region2 = $scope.reg2,
			regions = '',
			attackingDices = [],
			defendingDices = [],
			attackingQtyDices = (attackingQty > 3) ? 3 : attackingQty,
			defendingQtyDices = (Risk.getGraph()[region2].armySize > 2) ? 2 : Risk.getGraph()[region2].armySize,
			graph = Risk.getGraph();

		// Calculates losses in both sides
		var getAttackResult = function() {
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
		
		// Updates model with conquest result 
		var conquestRegion = function(regionConquest, from, combatResult) {
			graph[regionConquest].owner = Handshake.getConfig().userId;
			graph[regionConquest].armySize = attackingQty - combatResult.attacker;
			graph[from].armySize -= attackingQty;
		};

		// Ensure user has set a valid value for attacking
		if (attackingQty > 0) {
			for (i = 0; i < attackingQtyDices; i++) {
				attackingDices.push('dice' + Math.floor((Math.random() * 6) +1));
			}
			for (i = 0; i < defendingQtyDices; i++) {
				defendingDices.push('dice' + Math.floor((Math.random() * 6) +1));
			}
			attackingDices.sort();
			attackingDices.reverse();
			defendingDices.sort();
			defendingDices.reverse();
			$scope.attackingDices = attackingDices;
			$scope.defendingDices = defendingDices;
			
			ngDialog.close();
			ngDialog.open({ 
				template: 'client/app/components/errorDialogs/diceResult.html',
				scope: $scope,
				overlay: false,
				closeByDocument: false,
				closeByEscape: false,
				showClose: false
			});

			// Update model with casualties
			combatResult = getAttackResult();
			if (combatResult.attacker > 0) {
				graph[region1].armySize -= combatResult.attacker;
				Risk.setGraph(graph);
			}
			if (combatResult.defender > 0) {
				graph[region2].armySize -= combatResult.defender;
				// Defender is the only one can lose a region
				if (graph[region2].armySize === 0) {
					conquestRegion(region2, region1, combatResult);
				}
				Risk.setGraph(graph);
			}
			regions = region1 + ',' + region2;
			$scope.mapTriggerWatcher = regions;
			attackingQty = 0;
			// Sends to server the result to update other clients
			Socket.emit('applyMovementToParty', {
				attackingDices: attackingDices,
				defendingDices: defendingDices
			}, Risk.getGraph(graph), regions, Handshake.getConfig().party, Handshake.getConfig().userId);
		}
	};
	
	/**
	 * Manage a reorganization movement
	 */
	$scope.resolveMovement = function() {
		var i,
			region1 = $scope.reg1,
			region2 = $scope.reg2,
			regions = '',
			graph = Risk.getGraph();
			
		// Ensure user has set a valid number of armies to move
		if (moveQty > 0) {
			ngDialog.close();
			graph[region1].armySize -= moveQty;
 			graph[region2].armySize += moveQty;
			Risk.setGraph(graph);
			regions = region1 + ',' + region2;
			$scope.mapTriggerWatcher = regions;
			moveQty = 0;
			// Sends to server the result to update other clients
			Socket.emit('applyMovementToParty', null, Risk.getGraph(graph), regions, Handshake.getConfig().userId);
			$scope.finishTurn();
		}			
	};
	
	/**
	 * Reorganize army. One reorganization allowed
	 */
	$scope.reorganizeArmy = function() {
		reoganization = true;
	};
	
	/**
	 * Finish player's turn
	 */
	$scope.finishTurn = function() {
		$scope.waitMessage = Risk.getMessage('waitPlayerTurn');
		Socket.emit('turnFinished', Handshake.getConfig().party, Handshake.getConfig().userId);
		reoganization = false;
		$scope.turnActive = false;
		myBlockUI.start('Wait for other players');
	};

	/**
	 * Finish the game
	 */
	$scope.finishGame = function() {
		$window.location.href = '/';
	};	

	/**
	 * Manage in a stack origin / destiny regions
	 */
	$scope.onclick = function($event) {
		// Mustering phase
		if (mustering) {
			var region = $event.target.title;

			// Sets the army if allowed
			if (Risk.setArmy(region, 1)) {
				Socket.emit('mustering', Risk.getGraph(), region);
				$scope.musteringArmies--;
				$scope.waitMessage = Risk.getMessage('playerMusteringTurn', $scope.musteringArmies);
				$scope.mapTriggerWatcher = region;

				if ($scope.musteringArmies <= 0) {
					mustering = false;
					$scope.waitMessage = Risk.getMessage('playerAttackTurn');
				}			
			} else {
				ngDialog.open({ 
					template: 'client/app/components/errorDialogs/freeRegionAvailable.html'
				});
			}
		} else {
			if (regionStack.length < 2) {
				regionStack.push($event.target.title);
			} 
			
			// Reorganization phase
			if (reoganization) {
				if (regionStack.length === 2) {
					var reg1 = regionStack.shift(),
						reg2 = regionStack.shift();
					// Validates movement and regionStack is empty again
					if (Risk.checkAllyMovement(reg1, reg2)) {
						applyReorganizationMovement(reg1, reg2);
					} else {
						ngDialog.open({ 
							template: 'client/app/components/errorDialogs/movementNotAllowed.html'
						});
					}
				}
			// Attacking phase
			} else {
				if (regionStack.length === 2) {
					var reg1 = regionStack.shift(),
						reg2 = regionStack.shift();
					// Validates movement and regionStack is empty again
					if (Risk.checkMovement(reg1, reg2)) {
						applyMovement(reg1, reg2);
					} else {
						ngDialog.open({ 
							template: 'client/app/components/errorDialogs/movementNotAllowed.html'
						});
					}
				}
			}
		}
	};
});