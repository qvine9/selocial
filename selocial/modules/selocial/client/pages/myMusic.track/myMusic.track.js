/**
 * Create music controller
 */
angular.module('selocial').controller('MyMusic_trackPageController', function(api, uploader, error, notify, $rootScope, $scope, $reactive, $state, $stateParams, dialog){
    $reactive(this).attach($scope);

    var page = this;

    // Subscribe to track
    this.subscribe('tracks', function(){
        return [[ $stateParams.trackId ]];
    });

    // Subscribe to track
    this.subscribe('commissions', function(){
        return [ $stateParams.trackId ];
    });

    $scope.$on('$viewContentLoaded', function() {
        page.currentStep = parseInt($rootScope.currentUser.profile.tours.my_music) || 0;
    });

    page.helpers({
        track: function(){
            var track = Track.findOne({_id: $stateParams.trackId });
            if (!track){
                return;
            }
            track.releaseDate = new Date(track.releaseDate);
            track.purchasable = !!track.purchasable;
            return track;
        },
        commissions: function(){
            return TrackPaymentLog.find({trackId: $stateParams.trackId}, {sort: {date: -1}});
        },
        musicFile: function(){
            var track = Track.findOne({_id: $stateParams.trackId });
            if (track){
                return track.file;
            }
            return null;
        }
    });

    /**
     * Upload cover Art
     */
    page.uploadCoverArt = function() {
        uploader.uploadFiles({
            title: "Choose Your Track Cover Art",
            type: "image/*",
            process: "coverArt",
            trackId: $stateParams.trackId,
            isTrack: true
        });
    }

    page.releaseDateOptions = {
        maxDate: new Date()
    };

    /**
     * Save track
     */
    page.saveTrack = function(){
        if (!page.track.title) {
            if (page.musicFile && page.musicFile.metadata && page.musicFile.metadata.title) {
                page.track.title = page.musicFile.metadata.title;
            } else {
                return error("Please enter your track's title!");
            }
        }
        if (!page.track.artist) {
            if (page.musicFile && page.musicFile.metadata && page.musicFile.metadata.artist) {
                page.track.artist = page.musicFile.metadata.artist;
            } else {
                page.track.artist = $rootScope.currentUser.profile.name;
            }
        }
        page.track.file = page.musicFile;
        api('band.editTrack', { track: cleanObject(page.track) }).then(function(trackId){
            notify.success('You have successfully edited your track!');
            $state.go('myMusic');
        }).catch(error);
    };

    /**
     * Add contributor
     */
    page.addContributor = function(){
        page.track.contributors || (page.track.contributors = []);
        page.track.contributors.push({
            type: 'writer'
        });
    };

    /**
     * Add publisher
     */
    page.addPublisher = function(){
        page.track.publishers || (page.track.publishers = []);
        page.track.publishers.push({ });
    };

    /**
     * Add mechanical
     */
    page.addMechanical = function(){
        page.track.mechanicals || (page.track.mechanicals = []);
        page.track.mechanicals.push({ });
    };

    /**
     * Delete a track
     */
    page.deleteTrack = function(){
        dialog.confirm("WARNING! If this song is deleted then your fans will not be able to add your song to their playlists as well as YOUR SONG WILL GO MISSING within any fan mixes that contain your song!").then(function(confirmed){
            if(confirmed){
                api('band.deleteTrack', { trackId: page.track._id }).then(function(){
                    notify.success('Your song has been successfully deleted!');
                    $state.go('myMusic');
                }).catch(error);
            }
        });
    };

    /**
     * Adds tour
     * */
    if (!angular.isDefined($rootScope.currentUser.profile.tours)){
        $rootScope.currentUser.profile.tours = {};
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        });
    }

    page.postStepCallback = function() {
        console.log('my music band Tour - Update Step', this.currentStep);
        $rootScope.currentUser.profile.tours.my_music = this.currentStep;
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        });
    };

    page.postTourCallback = function() {
        console.log('my music band tour closes');
    };


    page.stepComplete = function() {
        console.log("my music Step completed!", 'currentStep', this.currentStep)
    };

    page.tourCompleteCallback = function() {
        console.log('my music tour completed');
    }
});
