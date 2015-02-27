'use strict';
/**
 *  Chat controller
 */
app.controller('ChatController', function($scope) {
	/**
	  * partyMessage event. Client receives messages from other users
	  */
	Socket.on('partyMessage', function(msg) {
		$scope.$apply(function() {
			console.log(msg);
		});
	});
});