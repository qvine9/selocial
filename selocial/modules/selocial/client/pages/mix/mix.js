/**
 * Most active page controller
 */
angular.module('selocial').controller('MixPageController', function(mixStream, $scope, $reactive, $stateParams){
    $reactive(this).attach($scope);
    
    this.mixStream = new mixStream(this, 'single-mix', {mixId: $stateParams.mixId});
});