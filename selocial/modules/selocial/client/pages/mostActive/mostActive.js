/**
 * Most active page controller
 */
angular.module('selocial').controller('MostActivePageController', function(mixStream, $scope, $reactive){
    $reactive(this).attach($scope);
    
    this.mostActiveStream = new mixStream(this, 'most-active-mixes', {});
});