'use strict';
/**
 * Risk service
 */
app.service('Chat', function(Handshake) {
	var chat = this,
		userId = Handshake.getConfig().userId,
		party = Handshake.getConfig().party;
	
	chat.newMessage = '';
	chat.history = [];

	// method binded to ng-enter, sends a message to party
	chat.sendMessage = function() {
		Socket.emit('partyMessage', chat.newMessage, userId);
		chat.newMessage = '';
	};
	
	// return the colour of the user who sent the message
	chat.getColour = function(userId) {
		for (var i = 0; i < party.length; i++) {
			if (userId === party[i].id) return party[i].colour;
		}
		return Handshake.getConfig().colour;
	};
});