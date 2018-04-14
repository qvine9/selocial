/**
 * Followers page controller
 */
angular.module('selocial').controller('FollowersPageController', function($reactive, $scope, mixStream){
    $reactive(this).attach($scope);
    
    this.channelStream = new mixStream(this, 'followers', {userId: Meteor.userId()});
    
});