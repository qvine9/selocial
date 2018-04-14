/**
 * Tag page controller
 */
angular.module('selocial').controller('TagPageController', function($stateParams, $reactive, $scope, mixStream){
    $reactive(this).attach($scope);
    
    this.channelName = $stateParams.tag;
    this.channelStream = new mixStream(this, 'tagged-mixes', {tag: $stateParams.tag}, true);
    
});