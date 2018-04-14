angular.module('mediaPlayer')

/**
 * Video Proxy component
 */
.directive('videoProxy', function(mediaPlayer){
    return {
        restrict: 'E',
        
        scope: {
        },
        
        link: function(scope, el){
            
            var reattachVideo = function($bindTo, forcePlay){
                var shouldPlay = !mediaPlayer.videoPlayer.paused;
                if (!$bindTo){
                    $bindTo = $('video-proxy').not(el);
                }
                if (!$bindTo.length){
                    $bindTo = $('body');
                }
                mediaPlayer.$videoPlayer.remove();
                $bindTo.append(mediaPlayer.$videoPlayer);
                mediaPlayer.updateVideo();
                if (shouldPlay || forcePlay){
                    mediaPlayer.videoPlayer.play();
                }
            };
            
            reattachVideo(el, true);
            
            scope.$on('$destroy', function(){
                reattachVideo();
            });
            
        },
        
        /**
         * Media player component controller
         */
        controller: function(){
        }
    };
});