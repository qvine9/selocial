angular.module('selocial')

/**
 * Fullscreen Payer component
 */
.directive('fullscreenPlayer', function($timeout, $location){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/fullscreenPlayer/fullscreenPlayer.html',
        controllerAs: 'comp',
        
        scope: {
            mix: "="
        },
        
        link: function(scope, element){         
        },
        
        controller: function($scope, $element){
            
            this.exitFullscreen = function(){
                $scope.mix = null;
            };
            
            $scope.$watch('mix', (mix)=>{
                if (!mix){
                    $('body').removeClass('fullscreen');
                } else {
                    $('body').addClass('fullscreen');
                    this.images = mix.video
                        ? null
                        : _.pluck(mix.images, 'url');
                }
            });
            
            
            
        }
    };
});