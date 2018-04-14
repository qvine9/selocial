/**
 * Create music controller
 */
angular.module('selocial').controller('MyMusic_createPageController', function(api, uploader, error, notify, $rootScope, $scope, $reactive, $state, $stateParams, dialog, $timeout){
    $reactive(this).attach($scope);

    var page = this;

    $scope.$on('$viewContentLoaded', function() {
        page.currentStep = parseInt($rootScope.currentUser.profile.tours.my_music);
    });

    // Subscribe to audio file
    this.subscribe('uploaded-files', function(){
        return [[ $stateParams.fileId ]];
    });

    page.helpers({
        musicFile: function(){
            return UploadedFile.findOne({_id: $stateParams.fileId })
        }
    });

    page.track = {
        releaseType: 'single',
        purchasable: true
    };

    page.releaseDateOptions = {
        maxDate: new Date()
    };

    /**
     * Upload cover Art
     */
    page.uploadCoverArt = function(){
        uploader.uploadFiles({
            title: "Choose Your Track Cover Art",
            type: "image/*",
            process: "coverArt",
            trackId: $stateParams.fileId,
            isTrack: false
        });
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
        api('band.uploadTrack', { track: cleanObject(page.track) }).then(function(trackId){
            notify.success('You have successfully uploaded your track!');
            $state.go('myMusic.track', {trackId: trackId});
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

    $scope.$watch('page.musicFile.processError', function(err){
        if (err){
            error("An error occured while processing your media file. Please upload a valid mp3 audio file!");
            $state.go('^');
        }
    });

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

    page.next = function () {
        $timeout( function () {
            $('.tour-next-tip').click();
        }, 100);
        if(page.currentStep == 4){
            $rootScope.currentUser.profile.tours.my_music = page.currentStep + 1;
            api('profile.update', {
                profile: $rootScope.currentUser.profile
            });
        }
    }

});
