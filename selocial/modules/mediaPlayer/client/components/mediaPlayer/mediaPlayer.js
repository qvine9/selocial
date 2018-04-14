angular.module('mediaPlayer')

/**
 * Media player component
 */
.directive('mediaPlayer', function(mediaPlayer, dialog){
    return {
        restrict: 'E',
        templateUrl: 'modules/mediaPlayer/client/components/mediaPlayer/mediaPlayer.html',

        scope: {
        },

        link: function(scope, el){

            var $trackControl = $('.track-control', el),
                $nowPlayingTime = $('.now-playing-time', el);

            $trackControl.slider({
                range: 'min',
                min: 0,
                max: 1000,
                step: 1,
                start: function(){
                    $trackControl.data('locked', true);
                },
                stop: function(event, ui){
                    $trackControl.data('locked', false);
                    mediaPlayer.seek(ui.value);
                }
            });

            mediaPlayer.setWidget({
                scope: scope,
                el: el,
                trackControl: $trackControl,
                nowPlayingTime: $nowPlayingTime
            });

            scope.$on('$destroy', function(){
               mediaPlayer.setWidget(null);
            });
        },

        /**
         * Media player component controller
         */
        controller: function($scope, dialog){

            /**
             * Get the track info
             */
            $scope.trackInfo = function(){
                var mediaElement = mediaPlayer.currentMediaElement;
                if (mediaElement.audioTracks){
                    var track = mediaElement.audioTracks[mediaPlayer.currentTrackIndex];
                     if (track){
                        dialog.show('trackInfo', {track: track.track}, {size: 'md'});
                    }
                    
                }
            };

            /**
             * Purchase track
             */
            $scope.purchase = function(){
                var mediaElement = mediaPlayer.currentMediaElement;
                if (mediaElement.audioTracks){
                    var track = mediaElement.audioTracks[mediaPlayer.currentTrackIndex];
                    if (track){
                        dialog.show('purchase', {trackId: track._id});
                    }
                }
            };


        }
    };
});
