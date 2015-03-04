'use strict';
/**
 *  Game set up controller
 */
app.controller('RiskSetupController', function($scope, $location, Risk, Handshake, blockUI, ngDialog) {
	// Block the user interface
	var myBlockUI = blockUI.instances.get('myBlockUI');
    myBlockUI.start('Wait for other players');

    // Ensures every set up is completly new. Service maintain the data if one connection with the server is lost and afterwards,
    // another user connects. The user who did not reconnect (waiting) had values from previous game
    Risk.setGraph(new MapGraph());
    // Binds our scope with the view
    Risk.initViewBind($scope);
	$scope.turn = Risk.getMessage('setUp');
	$scope.waitMessage = Risk.getMessage('waitSetUp');
	$scope.lastAction = '';
	$scope.initGame = false;
	$scope.party = Handshake.getConfig().party;

    var refreshView = function(region) {
    	$scope.mapTriggerWatcher = region;
    };

	/**
	 * Server asign to client its turn and pass the updated graph
	 */
	Socket.on('turnSetupStarted', function(graph, region, armiesLeft) {
		Risk.setGraph(graph);
		$scope.$apply(function() {
			refreshView(region);
			$scope.turn = Risk.getMessage('armiesLeft', armiesLeft); 
			$scope.waitMessage = Risk.getMessage('turnSetUp');
			if (region) $scope.lastAction = Risk.getMessage('placedArmy', region);
			myBlockUI.stop();
		});
	});

	/**
	 * Server sends data from other clients to be updated on client
	 * When event fired, UI should be blocked and should remain like that
	 */
	Socket.on('updateGraph', function(graph, region, party) {
		Risk.setGraph(graph);

		$scope.$apply(function() {
			Handshake.setConfig({
				party: party
			});
			$scope.party = Handshake.getConfig().party;

			refreshView(region);
			$scope.waitMessage = Risk.getMessage('turnSetUp');
			if (region) $scope.lastAction = Risk.getMessage('placedArmy', region);
		});
	});

	/**
	 * game setup phase finished
	 * Route to Risk
	 */
	Socket.on('setupPhaseFinished', function(graph) {
		Risk.setGraph(graph);
		$scope.$apply(function() {
			myBlockUI.stop();
			$location.path('/risk');
		});
	});

	/**
	 * If UI not blocked, this user is allowed to place an army
	 * After place army, an event is sent to server to notice following user can do the same
	 */
	$scope.onclick = function($event) {
		var region = $event.target.title;

		// Sets the army if allowed
		if (Risk.setArmy(region, 1)) {
			refreshView(region);
			$scope.waitMessage = Risk.getMessage('waitSetUp');
			myBlockUI.start('Wait for other players');
			Socket.emit('turnSetupFinished', Risk.getGraph(), region, Handshake.getConfig().party);			
		} else {
			ngDialog.open({ 
				template: 'client/app/components/errorDialogs/freeRegionAvailable.html'
			});
		}
	};
});