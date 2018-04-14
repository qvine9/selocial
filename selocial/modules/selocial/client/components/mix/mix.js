angular.module('selocial')

/**
 * Mix component
 */
.directive('mix', function($timeout, $location, dialog){
    var nextMixInstanceId = 1;
    var lastScrollTop = 0;

    var mixUrlRegex = /^#mix:([^\/]+):([^\/]+)$/;

    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/mix/mix.html',
        controllerAs: 'comp',

        scope: {
            mixId: "=mix",
            mixCache: "=",
            mixStream: "="
        },

        link: function(scope, element){
            var mixInstanceId = 'mix' + (nextMixInstanceId++);
            var isFlipped = false;

            /**
             * Show page
             *
             * Adds hash containing the current state of the mix. This allows deep-linking and
             * mobile back button navigation.
             */
            scope.showPage = function(pageName){
                if (!pageName || pageName !== 'main'){
                    lastScrollTop = $(window).scrollTop();
                }
                if (location.hash){
                    if (mixUrlRegex.test(location.hash)) {
                        var match = mixUrlRegex.exec(location.hash),
                            mixId = match[1];
                        if (mixId === mixInstanceId && pageName === 'main'){
                            // If we are closing the current mix, go back in history
                            history.back();
                            return;
                        }
                    }
                    // Otherwise replace the hash
                    $location.replace();
                    $location.hash('mix:' + mixInstanceId + ':' + pageName);
                } else {
                    // Set the hash
                    $location.hash('mix:' + mixInstanceId + ':' + pageName);
                }
            };

            /**
             * Flip the selected page
             */
            var showPage = function(pageName){
                if (pageName === 'main') {
                    element.removeClass('flipped').addClass('not-flipped');
                    isFlipped = false;
                } else {
                    element.removeClass('not-flipped').addClass('flipped')
                    isFlipped = true;
                }
                $timeout(function(){
                    scope.mixPage = pageName;
                }, 1);
            };

            /**
             * Listen for URL hash changes
             */
            scope.$watch(function () { return location.hash; }, function (url) {
                if (url && mixUrlRegex.test(url)){
                    $('body').addClass('flipped');
                    var match = mixUrlRegex.exec(url),
                        mixId = match[1],
                        pageName = match[2];

                    if (isFlipped && mixId !== mixInstanceId){
                        // Different mix, close if this one is open
                        showPage('main');
                    } else if (mixId === mixInstanceId) {
                        showPage(pageName);
                    }
                } else if (isFlipped) {
                    //var scrollTop = $(window).scrollTop();
                    // If the hash is empty, but the mix is open, close it
                    $('body').removeClass('flipped');
                    showPage('main');
                    setTimeout(function(){
                        $('html,body').animate({scrollTop: lastScrollTop}, 10);
                    }, 10);
                }
            });

            scope.$on('$destroy', function(){
                if (isFlipped){
                    $('body').removeClass('flipped');
                }
            });

            scope.$on('scrollToMix', function(event, currentMediaElementId){
                if (scope.mixId === currentMediaElementId){
                    var $parent = $(element.parents('.stream-panel').get(0));
                    if ($parent.length){
                        $parent.animate({
                            scrollLeft: Math.max(0, $parent.scrollLeft() + element.offset().left - $(window).width() / 2 + element.width() / 2)
                        }, 500);
                    }
                }
            });
        },

        /**
         * Mix component controller
         */
        controller: function($scope, $reactive, mediaPlayer, api, error, notify){
            $reactive(this).attach($scope);

            this.mixLoaded = false;

            this.helpers({
                mix: ()=>{
                    return ((this.mixLoaded = true) &&
                           Mix.findOne({_id: $scope.getReactively('mixId')})) ||
                           (this.mixLoaded = false) ||
                           $scope.getReactively('mixCache');
                },
                isBandMix: ()=>{
                    var mix = this.mix;
                    if (mix) {
                        var isOwnTrack = true;
                        _.each(mix.tracks, track => (isOwnTrack = isOwnTrack && track.userId === mix.userId));
                        return isOwnTrack;
                    }
                    return false;
                }
            });

            $scope.nextWhenFinishedVideo = false;
            $scope.isMuted = true;
            $scope.mixPage = 'main';

            $scope.$watch('comp.mix.video.url', (video)=>{
                if (video && (!this.mix.tracks || !this.mix.tracks.length)) {
                    $scope.isMuted = false;
                    $scope.nextWhenFinishedVideo = true;
                }
            });

            $scope.$watch('mixId', function(mixId){
                $scope.mixShareUrl = Meteor.absoluteUrl() + 'mix/' + mixId;
            });

            /**
             * Start / play state
             */
            $scope.togglePlayState = ()=>{
                if (mediaPlayer.currentMediaElementId === $scope.mixId && mediaPlayer.isPlaying) {
                    mediaPlayer.pause();
                } else {
                    if (!mediaPlayer.playlist || mediaPlayer.playlist.id !== $scope.mixStream.id){
                        mediaPlayer.setPlaylist(Playlist.fromMixStream($scope.mixStream));
                    }
                    mediaPlayer.goto(_.indexOf($scope.mixStream.mixIds, $scope.mixId));
                    mediaPlayer.play();
                }
            };

            /**
             * Upvote
             */
            $scope.upvote = function(){
                if (!Meteor.user()){
                    notify.error('Please sign in to upvote this mix!');
                } else {
                    api('social.upvote', {mixId: $scope.mixId});
                }
            };

            $scope.toggleMuted = function(){
                $scope.isMuted = !$scope.isMuted;
            };

            $scope.fullscreen = ()=>{
                $scope.$root.fullscreenMix = this.mix;
            };

            $scope.tip = ()=>{
                dialog.show('tip', {mix: this.mix});
            };
        }
    };
});
