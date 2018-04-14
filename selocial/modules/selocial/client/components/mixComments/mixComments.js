angular.module('selocial')

/**
 * Mix Comments component
 */
.directive('mixComments', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/mixComments/mixComments.html',
        controllerAs: 'ctrl',
        
        scope: {
            mix: "=",
            mixId: '='
        },
        
        link: function(scope, el){
            
            var isLocked = false;
            
            scope.scrollToBottom = function(){
                if (!isLocked){
                    isLocked = true;
                    setTimeout(function(){ isLocked = false; }, 1300)
                    
                    var scrolledCount = 0,
                        scrollIntervals = [200, 500];

                    var doScroll = function(){
                        el.parent().parent().animate({scrollTop: el.height()}, 200, function(){
                            scrolledCount++;
                            if (typeof(scrollIntervals[scrolledCount]) !== "undefined"){
                                setTimeout(doScroll, scrollIntervals[scrolledCount]);
                            }
                        });
                    };

                    setTimeout(doScroll, 10);
                }
            };
            
            scope.$watch('ctrl.comments.length', function(l){
                if (l){
                    scope.scrollToBottom();
                }
            });
        },
        
        /**
         * Mix component controller
         */
        controller: function($scope, api, error, $reactive, notify){
            $reactive(this).attach($scope);
            
            $scope.commentMessage = '';
            
            this.subscribe('mix-comments', function(){
                return [$scope.mixId];
            });
            
            this.helpers({
                comments: function(){
                    return Comment.find({mixId: $scope.mixId}, {sort: {date:1}});
                }
            });
            
            this.warnIfLoggedOut = function(){
                if (!Meteor.user()){
                    notify.error('Please sign in to send comments!');
                }
            };
            
            /**
             * Send a comment
             * 
             * @param {string} message
             */
            $scope.sendComment = function(){
                if (!$scope.commentMessage) {
                    error('Please enter your message!');
                    return;
                }
                api('social.comment', {mixId: $scope.mixId, message: $scope.commentMessage}).catch(error);
                $scope.commentMessage = '';
            };
            
        }
    };
});