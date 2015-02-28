'use strict';
/**
 * Risk service
 */
app.service('Chat', function(Handshake) {
	var chat = this,
		userId = Handshake.getConfig().userId;
	
	chat.newMessage = '';
	chat.history = [];
	
	
	chat.sendMessage = function() {
		var msg = userId + ': ' + chat.newMessage;
		Socket.emit('partyMessage', msg);
		chat.newMessage = '';
	};
});