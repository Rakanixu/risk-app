'use strict';
/**
 *  Chat controller
 */
app.controller('ChatController', function($scope, Chat) {
	$scope.chat = Chat;
	
	console.log($scope.chat);
	
	/**
	  * partyMessage event. Client receives messages from other users
	  */
	Socket.on('broadcastedPartyMessage', function(msg) {
		$scope.$apply(function() {
			console.log(msg);
		});
	});
});