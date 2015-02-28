'use strict';
/**
 *  Chat controller
 */
app.controller('ChatController', function($scope, Chat) {
	$scope.chat = Chat;
	
	/**
	  * partyMessage event. Client receives messages from other users
	  */
	Socket.on('broadcastedPartyMessage', function(msg, userId) {
		$scope.$apply(function() {
			Chat.history.push({
				colour: Chat.getColour(userId),
				value: msg
			});
		});
	});
});