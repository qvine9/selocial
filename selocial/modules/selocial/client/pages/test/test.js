angular.module('selocial').controller('TestPageController', function($scope, $state, $filter){
    
    $scope.log = '';
    
    _.each(['log', 'error'], function(func){
        console['_'+func] = console[func];
        console[func] = function(){
            var args = [];
            for (var i = 0; i < arguments.length; i++){
                args.push(arguments[i]);
                if (typeof(arguments[i]) === "string"){
                    $scope.log += arguments[i];
                } else {
                    $scope.log += func + ': ' + $filter('json')(arguments[i]) + "\n";
                }
            }
            console['_'+func].apply(console, args);
        };
    });
    
    
    $scope.code = '';
    $scope.run = function(){
        try {
            console.log( $filter('json')(eval($scope.code)) );
        } catch (err){
            console.error(err.message);
        }
        $scope.code = '';
    };
    
});