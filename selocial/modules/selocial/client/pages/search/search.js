/**
 * Search page controller
 */
angular.module('selocial').controller('SearchPageController', function($stateParams, $reactive, $scope, mixStream){
    $reactive(this).attach($scope);
    
    this.channelName = $stateParams.keyword;
    this.channelStream = new mixStream(this, 'search-mixes', {keyword: $stateParams.keyword});
    
});