angular.module('mediaPlayer')

/**
 * Initialize the module
 */    
.run(function($rootScope, mediaPlayer){
    
    $rootScope.mediaPlayer = mediaPlayer;
    
    $rootScope.$on('selocial.logout', function(){
        mediaPlayer.reset();
    });
    
});