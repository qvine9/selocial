/**
 * Latest page controller
 */

angular.module('selocial').controller('LatestPageController', function(uploader, api, auth, mixStream, $scope, $state, $reactive, $rootScope){
    
    $reactive(this).attach($scope);
    
    var page = this;
    
    page.isBrandMode = auth.hasRole('band');
    page.myStream = new mixStream(this, 'my-mixes', {userId: Meteor.userId()});
    
    
     /** 
     * Upload Music
     */
    page.uploadMusic = function(){
        uploader.uploadFiles({
            title: "Choose Your Music Track",
            type: "audio/*",
            process: "mixAudio"
        }).then(function(music){
            if (music) {
                $state.go('myMusic.create', {fileId: music._id});
            }
        });
    };
    
    
    //page.mostActiveStream = new mixStream('most-active-mixes', {});

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

    page.currentStep = parseInt($rootScope.currentUser.profile.tours.latest) || 0;
    page.postStepCallback = function() {
        console.log('Latest band Tour - Update Step', this.currentStep);
        $rootScope.currentUser.profile.tours.latest = this.currentStep;
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        });
    };

    page.postTourCallback = function() {
        console.log('latest band tour closes');
    };


    page.stepComplete = function() {
        console.log("Latest Step completed!", 'currentStep', this.currentStep)
    };

    page.tourCompleteCallback = function() {
        console.log('Latest tour completed');
    }

    page.getRole = function () {
        if(angular.isDefined($rootScope.currentUser.roles)){
            return 'band';
        }else{
            return 'notband';
        }
    };
});