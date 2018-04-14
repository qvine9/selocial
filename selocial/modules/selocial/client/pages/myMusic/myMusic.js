/**
 * My music controller
 */
angular.module('selocial').controller('MyMusicPageController', function(uploader, $state, $reactive, $scope, $rootScope, api, $timeout){
    $reactive(this).attach($scope);
    
    var page = this;
    
    // Subscribe to video file
    this.subscribe('my-tracks');
    this.subscribe('album-titles');
    
    page.helpers({
        myTracks: function(){
            return Track.find({userId: Meteor.userId() }, {sort: {date: -1}});
        },
    });

    /**
     * Determines where to start or continue tour from
     */
    $scope.$on('$viewContentLoaded', function() {
        page.currentStep = parseInt($rootScope.currentUser.profile.tours.my_music) || 0;
    });
    
    /**
     * Upload music
     */
    page.uploadMusic = function(){
        uploader.uploadFiles({
            title: "Choose Your Mp3 Audio Track",
            type: "audio/*",
            process: "mixAudio"
        }).then(function(music){
            if (music) {
                $timeout( function () {
                    $('.tour-next-tip').click();
                }, 100);
                if(page.currentStep == 1){
                    $rootScope.currentUser.profile.tours.my_music = page.currentStep + 1;
                    api('profile.update', {
                        profile: $rootScope.currentUser.profile
                    });
                }
                $state.go('myMusic.create', {fileId: music._id});

            }
        });
    };

    /**
     * Print album name if any
     * @param track
     */
    page.printAlbumTitle = function (track) {
        // console.log(track.albumId);
        var album = Album.findOne({_id: track.albumId}, {_id: 1, title: 1});
        // console.log(album);
        if (!album) {
            // console.log('Error fetching album details from DB!');
            return;
        }
        if (track.albumId) return ' | ' + album.title;
        return '';
    }

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

    page.location = function () {
        return window.location.pathname;
    }
});
