angular.module('mediaPlayer')

/**
 * Audio track component
 */
.directive('audioTrack', function(){
    var nextAudioTrackId = 1;

    return {
        restrict: 'A',
        templateUrl: 'modules/mediaPlayer/client/components/audioTrack/audioTrack.html',

        scope: {
            audioTrack: '=',
            onClick: '&',
            addHandle: '=',
            handleIcon: '@'
        },

        /**
         * Audio track component controller
         */
        controller: function($scope, mediaPlayer, dialog){

            $scope.audioTrackId = nextAudioTrackId++;
            $scope.isOpen = false;

            /**
             * Play music
             */
            $scope.play = function(){
                mediaPlayer.setPlaylist(Playlist.fromAudioTrack($scope.audioTrack));
                mediaPlayer.goto(0);
                //mediaPlayer.play();
            };

            /**
             * Pause music
             */
            $scope.pause = function(){
                mediaPlayer.pause();
            };

            /**
             * Get the track info
             */
            $scope.trackInfo = function(){
                switch($scope.audioTrack.source){
                    case 'soundcloud':
                        if ($scope.audioTrack.file.permalink){
                            return window.open($scope.audioTrack.file.permalink);
                        }
                        break;
                    default:
                        dialog.show('trackInfo', {track: $scope.audioTrack}, {size: 'md'});
                        break;
                }
            };

            /**
             * Purchase track
             */
            $scope.purchase = function(){
                dialog.show('purchase', {trackId: $scope.audioTrack._id});
            };

        }
    };
});
