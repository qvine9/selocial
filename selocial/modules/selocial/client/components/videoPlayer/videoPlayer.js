angular.module('selocial')

/**
 * Video player component
 */
.directive('videoPlayer', function(mediaPlayer){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/videoPlayer/videoPlayer.html',
        
        scope: {
            video: '=',
            play: '=',
            muted: '=',
            nextWhenFinishedVideo: '='
        },
        
        link: function(scope, element, attr){
            
            var $video = $('video', element),
                video = $video.get(0);
            
            scope.$watch('nextWhenFinishedVideo', function(nextWhenFinishedVideo){
                if (nextWhenFinishedVideo){
                    $video.prop('loop', false);
                    video.onended = function(){
                        mediaPlayer.next();
                    };
                }
            });
            
            scope.$watch('play', function(play){
                if (play) {
                    video.play();
                } else {
                    video.pause();
                }
            });
            
            scope.$watch('muted', function(muted){
                $video.prop('muted', !!muted);
            });
        }
    };
});