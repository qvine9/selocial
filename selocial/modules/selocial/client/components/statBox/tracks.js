angular.module('selocial')

/**
 * Stat box component
 */
.directive('statBoxTracks', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/statBox/tracks.html',
        
        scope: {
            tracks: '='
        },
        
        /**
         * Profile card component controller
         */
        controller: function($scope, api, $reactive){
            $reactive(this).attach($scope);
        }
    };
});