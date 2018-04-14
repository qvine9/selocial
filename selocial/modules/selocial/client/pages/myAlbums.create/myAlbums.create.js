/**
 * Create album controller
 */
angular.module('selocial').controller('MyAlbums_createPageController', function(api, uploader, error, notify, $rootScope, $scope, $reactive, $state, $stateParams, dialog, $timeout){
    $reactive(this).attach($scope);

    var page = this;
    page.tracks = [];

    $scope.searchResultPage = 0;
    $scope.searchResultPageCount = 0;
    $scope.searchResultCount = 0;

    // Subscribe to tracks updates
    page.subscribe('my-non-album-tracks');

    page.helpers({
        _tracks: function () {
            page.tracks = Track.find({userId: Meteor.userId()}, {sort: {date: -1}}).fetch();
        }
    });

    page.album = {
        userId: Meteor.userId(),
        releaseType: 'single',
        purchasable: true,
        price: 1,
        tracks: [],
        images: [],
        locked: false,
};

/**
 * Upload cover Art
 */
page.uploadCoverArt = function(append){
    if (page.album.images.length && page.album.images.length > 9) {
        dialog.show('Max 10 images allowed', {}, {});
        return;
    }
    uploader.uploadFiles({
        title: "Choose Your Album Cover Art",
        multiple: true,
        type: "image/*",
        process: "coverArtAlbum"
    }).then(function(images){
        if (images && images.length) {
            if (append) {
                page.album.images = page.album.images.concat(images);
            } else {
                page.album.images = images.slice();
            }
        }
        console.log(page.album);
    });
};

    /**
     * Remove a photo
     */
    page.removePhoto = function($index){
        page.album.images.splice($index, 1);
    };

    /**
     * Update page data
     */
    page.updatePageData = function(){
        $scope.searchResultCount = page.tracks.length;
        $scope.searchResultPageCount = Math.ceil(page.tracks.length / 5);
        if ($scope.searchResultPage > $scope.searchResultPageCount - 1) {
            $scope.searchResultPage = $scope.searchResultPageCount - 1;
        }
        if ($scope.searchResultPage < 0) {
            $scope.searchResultPage = 0;
        }
        page.album.duration = 0;
        page.album.tracks.forEach(t => page.album.duration += t.file.metadata ? t.file.metadata.duration : t.file.process.duration);
    };

    /**
     * Add track to the selected tracks
     *
     * @param {type} audioTrack
     * @returns {undefined}
     */
    page.addTrack = function(audioTrack){
        page.tracks.splice(_.indexOf(page.tracks, audioTrack), 1);
        if (!audioTrack.albumId)
            audioTrack.originalTrack = audioTrack._id;
        page.album.tracks.push(audioTrack);
        page.updatePageData();
    };

    /**
     * Remove track from the selected tracks
     *
     * @param {type} audioTrack
     * @returns {undefined}
     */
    page.removeTrack = function(audioTrack){
        page.album.tracks.splice(_.indexOf(page.album.tracks, audioTrack), 1);
        page.tracks.push(audioTrack);
        page.updatePageData();
    };

    /**
     * Save album
     */
    page.saveAlbum = function(){
        if (!page.album.title || page.album.title === '') {
            return error("Please enter your album's title!");
        }
        if (!page.album.artist || page.album.artist === '') {
            page.album.artist = $rootScope.currentUser.profile.name;
        }
        api('band.createAlbum', { album: cleanObject(page.album) }).then(function(){
            notify.success('You have successfully created your album!');
            $state.go('myAlbums');
        }).catch(error);
    };

    // $scope.$watch('page.musicFile.processError', function(err){
    //     if (err){
    //         error("An error occured while processing your media file. Please upload a valid mp3 audio file!");
    //         $state.go('^');
    //     }
    // });

    /**
    * Adds tour
    * */
    // if (!angular.isDefined($rootScope.currentUser.profile.tours)){
    //     $rootScope.currentUser.profile.tours = {};
    //     api('profile.update', {
    //         profile: $rootScope.currentUser.profile
    //     });
    // }
    //
    // page.postStepCallback = function() {
    //     console.log('my music band Tour - Update Step', this.currentStep);
    //         $rootScope.currentUser.profile.tours.my_music = this.currentStep;
    //         api('profile.update', {
    //             profile: $rootScope.currentUser.profile
    //         });
    // };
    //
    // page.postTourCallback = function() {
    //     console.log('my music band tour closes');
    // };
    //
    //
    // page.stepComplete = function() {
    //     console.log("my music Step completed!", 'currentStep', this.currentStep)
    // };
    //
    // page.tourCompleteCallback = function() {
    //     console.log('my music tour completed');
    // }
    //
    // page.next = function () {
    //     $timeout( function () {
    //         $('.tour-next-tip').click();
    //     }, 100);
    //     if(page.currentStep == 4){
    //         $rootScope.currentUser.profile.tours.my_music = page.currentStep + 1;
    //         api('profile.update', {
    //             profile: $rootScope.currentUser.profile
    //         });
    //     }
    // }

});
