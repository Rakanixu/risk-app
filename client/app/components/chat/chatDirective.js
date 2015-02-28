'use strict';
/**
 *	Custom directive to manipulate the chat panel
 */
app.directive('chatDirective', function() {
	return {
		templateUrl: 'client/app/components/chat/chat.html',
		link: function($scope, $element, attrs) {
			
		}
	}
});

app.directive('ngEnter', function () {
    return {
		link: function ($scope, element, attrs) {
			element.bind('keydown keypress', function (event) {
				if (event.which === 13) {
					$scope.chat.sendMessage();	 
					event.preventDefault();
				}
			});
		}
	}
});