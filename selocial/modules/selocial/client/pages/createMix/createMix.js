/**
 * Create Mix controller
 */
angular.module('selocial').controller('CreateMixPageController', function($scope, $rootScope, uploader, $stateParams, $state, $reactive, error, api, dialog){
    $reactive(this).attach($scope);

    var page = this;
    
    $scope.$on('$viewContentLoaded', function() {
        page.currentStep = parseInt($rootScope.currentUser.profile.tours.createMix);
    });

    page.imageIds = [];
    page.videoId = null;
    page.processError = false;

    // Subscribe to image files
    this.subscribe('uploaded-files', function(){
        return [page.getCollectionReactively('imageIds')];
    });

    // Subscribe to video file
    this.subscribe('uploaded-files', function(){
        return [[page.getReactively('videoId')]];
    });

    // Reactive helpers
    this.helpers({
        /**
         * Image files
         */
        images: function(){
            var ids = page.getCollectionReactively('imageIds');
            if(!ids || ids.length === 0) {
                return;
            }
            return UploadedFile.find({_id: {$in: ids }}, {sort: {priority: 1}});
        },

        /**
         * Video file
         */
        video: function(){
            var id = page.getReactively('videoId');
            if (!id) {
                return;
            }
            return UploadedFile.findOne({_id: id });
        },

        /**
         * Check for processing errors
         */
        processError: function(){
            var video = page.getReactively('video');
            if (video && video.processError) {
                return true;
            }
            var images = page.getCollectionReactively('images');
            if (images && images.length) {
                for (var i = 0; i < images.length; i++) {
                    if (images[i].processError) {
                        return true;
                    }
                }
            }
            return false;
        }
    });

    var shouldSavePending = true;

    if ($stateParams.mixId){
        shouldSavePending = false;
        api('mix.get', {mixId: $stateParams.mixId}).then(function(mix){
            if (mix){
                page.mix = mix;
                page.musicTracks = page.mix.tracks;
                page.imageIds = mix.images ? _.pluck(mix.images, "_id") : [];
                page.videoId = mix.video ? mix.video._id : null;
            }
        });
    } else if ($rootScope.pendingMix){
        page.mix = $rootScope.pendingMix.mix;
        page.musicTracks = $rootScope.pendingMix.musicTracks || [];
        page.imageIds = $rootScope.pendingMix.imageIds || [];
        page.videoId = $rootScope.pendingMix.videoId;
    } else {
        // New mix
        page.mix = { isPublic: !Meteor.user().profile.privateChannel };
        page.musicTracks = [];
    }

    if ($stateParams.videoId){
        page.videoId = $stateParams.videoId;
    }
    /**
     * Reset pending mix
     */
    function resetPending(){
        $rootScope.pendingMix = null;
        shouldSavePending = false;
    };

    $scope.$on('$stateChangeStart', function(){
        if (shouldSavePending){
            $rootScope.pendingMix = {
                mix: page.mix,
                musicTracks: page.musicTracks,
                imageIds: page.imageIds,
                videoId: page.videoId
            };
        }
    });

    /**
     * Upload images
     */
    page.uploadImages = function(append){
        uploader.uploadFiles({
            title: "Choose Photos",
            multiple: true,
            type: "image/*",
            process: "mixImage"
        }).then(function(images){
            if (images && images.length) {
                if (append) {
                    page.imageIds = page.imageIds.concat(_.map(images, function(image){ return image._id; }));
                } else {
                    page.imageIds = _.map(images, function(image){ return image._id; });
                }
            }
        });
    };

    /**
     * Upload video
     */
    page.uploadVideo = function(){
        uploader.uploadFiles({
            title: "Choose Video",
            type: "video/*",
            process: "mixVideo"
        }).then(function(video){
            if (video) {
                page.videoId = video._id;
            }
        });
    };

    /**
     * Create a mix
     */
    page.createMix = function(){
        if ($stateParams.mixId) {
            api('mix.edit', {
                mixId: $stateParams.mixId,
                mix: page.mix,
                imageIds: page.imageIds,
                videoId: page.videoId,
                musicTracks: page.musicTracks
            }).then(function(){
                $state.go('latest');
            }).catch(error);
        } else {
            api('mix.create', {
                mix: page.mix,
                imageIds: page.imageIds,
                videoId: page.videoId,
                musicTracks: page.musicTracks
            }).then(function(){
                resetPending();
                $state.go('latest');
            }).catch(error);
        }
    };

    /**
     * Remove a photo
     */
    page.removePhoto = function($index){
        page.imageIds.splice($index, 1);
    };

    /**
     * Remove audio and video
     */
    page.resetImagesAndVideo = function(){
        page.video = null;
        page.images = [];
        page.imageIds = [];
        page.videoId = null;
    };

    /**
     * Listen for process errors
     */
    $scope.$watch('page.processError', function(err){
        if (err){
            page.resetImagesAndVideo();
            error("An error occured when processing your uploaded media files. Please upload valid images or video.");
        }
    });

    /**
     * Remove a mix
     */
    page.removeMix = function(){
        dialog.confirm('Do you really want to delete this mix?').then(function(confirmed){
            if (confirmed){
                api('mix.remove', {mixId: $stateParams.mixId}).then(function(){
                    $state.go('latest');
                });
            }
        });
    };

    /**
     * Adds tour for this view
     *
     */

    if (!angular.isDefined($rootScope.currentUser.profile.tours)){
        $rootScope.currentUser.profile.tours = {};
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        });
    }
    page.currentStep = parseInt($rootScope.currentUser.profile.tours.create_mix) || 0;
    page.postStepCallback = function() {
        console.log('Create mix Tour - Update Step', this.currentStep);
        $rootScope.currentUser.profile.tours.create_mix = this.currentStep;
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        });
    };

    page.postTourCallback = function() {
        console.log('Create-mix tour closes');
    };


    page.stepComplete = function() {
        console.log("Create mix Step completed!", 'currentStep', this.currentStep)
    };

    page.tourCompleteCallback = function() {
        console.log('Create mix tour completed');
    }
    
    page.getRole = function () {
        if(angular.isDefined(Meteor.user().roles)){
            return 'band';
        }else{
            return 'notband';
        }
    };
});
