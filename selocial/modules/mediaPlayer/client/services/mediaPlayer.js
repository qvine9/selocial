angular.module('mediaPlayer').service('mediaPlayer', function($rootScope){
    
    return new MediaPlayer($rootScope);
    
});