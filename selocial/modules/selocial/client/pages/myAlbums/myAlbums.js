/**
 * My albums controller
 */
angular.module('selocial').controller('MyAlbumsPageController', function($state, $reactive, $scope, $rootScope, api, $timeout){
    $reactive(this).attach($scope);
    
    var page = this;
    
    // Subscribe to video file
    this.subscribe('my-albums');

    page.helpers({
        albums: function () {
            return Album.find({userId: Meteor.userId() }, {sort: {date: -1}});
        }
    });

    page.formatDuration = function (s){
        if (!s) return '00:00:00';
        return (s-(s%=60))/60+(9<s?':':':0')+s;
    };

    page.isEditor = function () {
        return !($state.current.name === 'myAlbums.album' || $state.current.name === 'myAlbums.create');
    }

    /**
     * Determines where to start or continue tour from
     */
    // $scope.$on('$viewContentLoaded', function() {
    //     page.currentStep = parseInt($rootScope.currentUser.profile.tours.my_album) || 0;
    // });

    /**
     * create Album
     */
    page.createAlbum = function(){
        // uploader.uploadFiles({
        //     title: "Choose Your Mp3 Audio Track",
        //     type: "audio/*",
        //     process: "mixAudio"
        // }).then(function(music){
        //     if (music) {
        //         $timeout( function () {
        //             $('.tour-next-tip').click();
        //         }, 100);
        //         if(page.currentStep == 1){
        //             $rootScope.currentUser.profile.tours.my_music = page.currentStep + 1;
        //             api('profile.update', {
        //                 profile: $rootScope.currentUser.profile
        //             });
        //         }
        //         $state.go('myMusic.create', {fileId: music._id});
        //
        //     }
        // });
        $state.go('myAlbums.create');
    };

    /**
     * Adds tour
     * */
    // if (!angular.isDefined($rootScope.currentUser.profile.tours)){
    //     $rootScope.currentUser.profile.tours = {};
    //     api('profile.update', {
    //         profile: $rootScope.currentUser.profile
    //     });
    // };
    //
    // page.postStepCallback = function() {
    //     console.log('my music band Tour - Update Step', this.currentStep);
    //     $rootScope.currentUser.profile.tours.my_music = this.currentStep;
    //     api('profile.update', {
    //         profile: $rootScope.currentUser.profile
    //     });
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
    // };

    page.location = function () {
        return window.location.pathname;
    };
});
