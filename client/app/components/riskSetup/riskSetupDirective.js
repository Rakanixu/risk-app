'use strict';
/**
 *	Custom directive to manipulate the DOM
 */
app.directive('riskSetupDirective', function($location, $compile, Risk, Handshake) {
	var party = Handshake.getConfig().party,
		soldierPath = 'client/assets/img/soldier.png',
		knightPath = 'client/assets/img/knight.gif',
		cannonPath = 'client/assets/img/cannon.png',
		soldierVal = Risk.getArmyVal().soldierVal,
		knightVal = Risk.getArmyVal().knightVal,
		cannonVal = Risk.getArmyVal().cannonVal,
		target = 'div.';

	var generateMarkup = function($element, $scope, region) {
		if (typeof region === 'string' && region.length > 0) {
			var colour = '',
				style = '',
				styleMargin = '',
				margin = 0,
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
				styleMargin = 'margin-left:' + margin + 'px';
				$element.find(target + region).append('<img class="cannon" src="' + cannonPath + '" style="' + style + styleMargin + '"/>');
				margin += 30;
			}
			for (i = 0; i < knights; i++) {
				styleMargin = 'margin-left:' + margin + 'px';
				$element.find(target + region).append('<img src="' + knightPath + '" style="' + style + styleMargin + '"/>');								
				margin += 15;
			}
			for (i = 0; i < soldiers; i++) {
				styleMargin = 'margin-left:' + margin + 'px';
				$element.find(target + region).append('<img src="' + soldierPath + '" style="' + style + styleMargin + '"/>');
				margin += 15;
			}

			// Append a icon for each action. attack / reorganization
			if ($scope.viewAction === Risk.getViewActions().attack) {
				$element.find(target + region).append($compile('<img ng-show="updateRegionFrom == \'' + region + '\' || updateRegionTo == \'' + region + '\'" class="action-icon" src="client/assets/img/smoke.gif"/>')($scope));
			} else if ($scope.viewAction === Risk.getViewActions().reorganization) {
				$element.find(target + region).append($compile('<img ng-show="updateRegionFrom == \'' + region + '\' || updateRegionTo == \'' + region + '\'" class="action-icon" src="client/assets/img/reorganization.png"/>')($scope));
			}
		}
	};

	return {
		link: function($scope, $element, attrs) {
			// Watching mapTriggerWatcher string. The region updated is pass as param - newValue
			$scope.$watch('mapTriggerWatcher', function(region) {
				var regions = region.split(',');
				
				for (var i = 0; i < regions.length; i++) {
					generateMarkup($element, $scope, regions[i]);
				}
				// Set to empty string if same attack is repeated and value does not change
				$scope.mapTriggerWatcher = '';
			});

			// When custom path is '/risk', refresh the view with custom data model
			if ($location.$$path === '/risk') {
				for (var reg in Risk.getGraph()) {
					generateMarkup($element, $scope, reg);
				}
			}
		}
	}
});