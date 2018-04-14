angular.module('selocial')

/**
 * Track composer component
 */
.directive('trackComposer', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/trackComposer/trackComposer.html',
        require: 'ngModel',
        
        scope: {
            canHaveNoMusic: '='
        },
        
        link: function(scope, el, attrs, ngModel){  
            scope.$watchCollection('selectedTracks', function(x){
                ngModel.$setViewValue(x);
            });
            
            ngModel.$render = function(){
                if (ngModel.$modelValue) {
                    _.each(ngModel.$modelValue, function(track){
                        scope.addTrack(track);
                    })
                    
                }
            };
        },

        /**
         * Audio track component controller
         */
        controller: function($scope, soundcloud, uploader, error, api, auth, dialog){
            
            var isBrandMode = auth.hasRole('band');
            $scope.isBrandMode = isBrandMode;
            $scope.totalTime = (Meteor.user().timebankBalance || 900);
            $scope.totalAvailableTime = $scope.totalTime;
            $scope.totalBaseTime = !isBrandMode ? 15*60 : 30*60;
            if ($scope.totalTime < $scope.totalBaseTime) {
                $scope.totalBaseTime = $scope.totalTime;
            }
            $scope.totalExtraTime = $scope.totalTime - $scope.totalBaseTime;
            
            $scope.trackResults = [];
            $scope.selectedTracks = [];
            $scope.audioSearch = '';
            $scope.searchResultPage = 0;
            $scope.searchResultPageCount = 0;
            $scope.searchResultCount = 0;
            
            $scope.noMusic = false;
            
            $scope.haveNoMusic = function(){
                $scope.noMusic = !$scope.noMusic;
            };
            
            /**
             * Handle the addition of an audio track
             * @param {object} audioTrack
             * @returns {Boolean}
             */
            var handleAudioTrackAdd = function(audioTrack){
                var duration = audioTrack.file.metadata ? audioTrack.file.metadata.duration : audioTrack.file.process.duration;
                if ($scope.totalTime < duration) {
                    error(new Meteor.Error("This track is too long, you don't have this much time left!"));
                    return false;
                }
                return true;
            };
            
            /**
             * Update page data
             */
            var updatePageData = function(){
                $scope.searchResultCount = $scope.trackResults.length;
                $scope.searchResultPageCount = Math.ceil($scope.trackResults.length / 5);
                if ($scope.searchResultPage > $scope.searchResultPageCount - 1) {
                    $scope.searchResultPage = $scope.searchResultPageCount - 1;
                }
                if ($scope.searchResultPage < 0) {
                    $scope.searchResultPage = 0;
                }
            };
            
            // Source track list
            $scope.connectedSortableOptions = {
                connectWith: ".tracklist",
                handle: '.handle',
                delay: 300,
                update: function(e, ui) {
                    if (handleAudioTrackAdd(ui.item.sortable.model)){
                        $scope.addTrack(ui.item.sortable.model);
                    }
                    ui.item.sortable.cancel();
                }
            };
            
            // Target track list
            $scope.selectedSortableOptions = {
                axis: 'y',
                handle: '.handle',
                delay: 300
            };
            
            // Preload the API to gain some extra time
            soundcloud.getSoundCloudApi();

            /**
             * Find tracks on soundcloud
             * 
             * @param {string} keywords
             * @returns {undefined}
             */
            $scope.findTracks = function(keywords){
                $scope.searchResultPage = 0;
                $scope.searchResultPageCount = 0;
                $scope.trackResults = [];
                $scope.searchResultCount = 0;
                api('search.tracks', {keywords: keywords, ownTracksOnly: isBrandMode}).then(function(tracks){
                    $scope.trackResults = tracks || [];
                    updatePageData();
                    if (!isBrandMode) {
                        soundcloud.search(keywords).then(function(tracks){
                            $scope.trackResults = $scope.trackResults.concat(tracks);
                            updatePageData();
                        });
                    }
                }).catch(error);
            };
            
            /**
             * Add track to the selected tracks
             * 
             * @param {type} audioTrack
             * @returns {undefined}
             */
            $scope.addTrack = function(audioTrack){
                if (handleAudioTrackAdd(audioTrack)) {
                    $scope.trackResults.splice(_.indexOf($scope.trackResults, audioTrack), 1);
                    $scope.selectedTracks.push(audioTrack);
                    var duration = audioTrack.file.metadata ? audioTrack.file.metadata.duration : audioTrack.file.process.duration;
                    $scope.totalTime -= duration;
                    updatePageData();
                }
            };
            
            /**
             * Remove track from the selected tracks
             * 
             * @param {type} audioTrack
             * @returns {undefined}
             */
            $scope.removeTrack = function(audioTrack){
                $scope.selectedTracks.splice(_.indexOf($scope.selectedTracks, audioTrack), 1);
                $scope.trackResults.push(audioTrack);
                var duration = audioTrack.file.metadata ? audioTrack.file.metadata.duration : audioTrack.file.process.duration;
                $scope.totalTime += duration;
                updatePageData();
            };
            
            /**
             * Next page
             */
            $scope.nextPage = function(){
                $scope.searchResultPage++;
            };
            
            /**
             * Prev page
             */
            $scope.prevPage = function(){
                $scope.searchResultPage--;
            };

            $scope.showReferralDialog = function () {
                dialog.show('referral', {size: 'lg'});
                $('.popover').remove();
            };
            
            if (isBrandMode) {
                $scope.findTracks('');
            }
        }
    };
});