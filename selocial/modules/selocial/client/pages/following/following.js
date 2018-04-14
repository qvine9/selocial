/**
 * Following page controller
 */
angular.module('selocial').controller('FollowingPageController', function($reactive, $scope, mixStream){
    $reactive(this).attach($scope);
    
    this.channelStream = new mixStream(this, 'following', {userId: Meteor.userId()}, true);
    
});