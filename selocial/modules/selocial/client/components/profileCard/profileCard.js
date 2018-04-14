angular.module('selocial')

/**
 * Profile card component
 */
.directive('profileCard', function(){
    return {
        restrict: 'A',
        templateUrl: 'modules/selocial/client/components/profileCard/profileCard.html',
        controllerAs: 'card',
        
        scope: {
            userId: "=profileCard",
            showName: '=',
            showFollow: '=',
            linkToProfile: '='
        },
        
        /**
         * Profile card component controller
         */
        controller: function($scope, api, $reactive){
            $reactive(this).attach($scope);
            
            this.subscribe('User', function(){
                return [ $scope.getReactively('userId') ];
            });
            
            this.helpers({
                isFollowing: () => {
                    var userId = $scope.getReactively('userId');
                    if (userId){
                        var currentUser = Meteor.user();
                        return currentUser && currentUser.following && _.contains(currentUser.following, userId);
                    }
                    return false;
                },
                
                user: () => {
                    var userId = $scope.getReactively('userId');
                    if (userId){
                        return User.findOne({_id: userId});
                    }
                },
                
                image: () => {
                    $scope.getReactively('card.user.profile.image._id');
                    return $scope.getReactively('card.user.profile.image');
                }
            });
            
            $scope.follow = function(){
                if ($scope.followLoading)
                    return;
                
                $scope.followLoading = true;
                api('social.follow', {userId: $scope.userId}).then(() => {
                    $scope.followLoading = false;
                });
            };
            
        }
    };
});