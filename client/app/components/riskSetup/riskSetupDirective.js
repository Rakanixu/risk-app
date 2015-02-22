'use strict';
/**
 *	Custom directive to manipulate the DOM
 */
app.directive('riskSetupDirective', function($location, Risk, Handshake) {
	var party = Handshake.getConfig().party,
		soldierPath = 'client/assets/img/soldier.png',
		knightPath = 'client/assets/img/knight.gif',
		cannonPath = 'client/assets/img/cannon.png',
		soldierVal = Risk.getArmyVal().soldierVal,
		knightVal = Risk.getArmyVal().knightVal,
		cannonVal = Risk.getArmyVal().cannonVal,
		target = 'div.';

	var generateMarkup = function($element, region) {
		if (typeof region === 'string' && region.length > 0) {
			var colour = '',
				style = '',
				cannons = 0,
				knights = 0,
				possibleKnights = 0,
				soldiers = 0,
				armySize = Risk.getGraph()[region].armySize ? Risk.getGraph()[region].armySize : 0,
				i;

			if (Risk.getGraph()[region].owner === Handshake.getConfig().userId) {
				colour = Handshake.getConfig().colour;
			} else {
				for (var j = 0; j < party.length; j++) {
					if (Risk.getGraph()[region].owner === party[j].id) {
						colour = party[j].colour
						break;
					}
				}
			}

			style = 'background: -webkit-linear-gradient(' + colour + ',' + colour + ');' +
					'background: -o-linear-gradient(' + colour + ',' + colour + ');' +
					'background: -moz-linear-gradient(' + colour + ',' + colour + ');' +
					'background: linear-gradient(' + colour + ',' + colour + ');';

			cannons = Math.floor(armySize / cannonVal); //Number of cannons
			possibleKnights = armySize % cannonVal; //Number of posible remain knigts
			knights = Math.floor(possibleKnights / knightVal); //Number of knigts
			soldiers = possibleKnights % knightVal; //Number of soldiers

			// $scope is not modified or binded - no need for $compile
			$element.find(target + region).empty();
			for (i = 0; i < cannons; i++) {
				$element.find(target + region).append('<img class="cannon" src="' + cannonPath + '" style="' + style + '"/>');
			}
			for (i = 0; i < knights; i++) {
				$element.find(target + region).append('<img src="' + knightPath + '" style="' + style + '"/>');
			}
			for (i = 0; i < soldiers; i++) {
				$element.find(target + region).append('<img src="' + soldierPath + '" style="' + style + '"/>');
			}
		}
	};

	return {
		link: function($scope, $element, attrs) {
			// Watching mapTriggerWatcher string. The region updated is pass as param - newValue
			$scope.$watch('mapTriggerWatcher', function(region) {
				var regions = region.split(',');
				
				for (var i = 0; i < regions.length; i++) {
					generateMarkup($element, regions[i]);
				}
				// Set to empty string if same attack is repeated and value does not change
				$scope.mapTriggerWatcher = '';
			});

			// When custom path is '/risk', refresh the view with custom data model
			if ($location.$$path === '/risk') {
				for (var reg in Risk.getGraph()) {
					generateMarkup($element, reg);
				}
			}
		}
	}
});