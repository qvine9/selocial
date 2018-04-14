/**
 * Dashboard page controller
 */
angular.module('selocial').controller('DashboardPageController', function($rootScope, $scope, $reactive, uploader, api, error, notify, auth, dialog){
    $reactive(this).attach($scope);
    
    var page = this;
    
    var isBrandMode = auth.hasRole('band');
    $scope.isBrandMode = isBrandMode;
    $scope.totalTime = (Meteor.user().timebankBalance || 900);
    $scope.totalAvailableTime = $scope.totalTime;
    $scope.totalBaseTime = !isBrandMode ? 15*60 : 30*60;
    console.log($scope.totalTime, $scope.totalBaseTime, auth.hasRole('band'));
    if ($scope.totalTime < $scope.totalBaseTime) {
        $scope.totalBaseTime = $scope.totalTime;
    }
    $scope.totalExtraTime = $scope.totalTime - $scope.totalBaseTime;
    
    // Subscribe to video file
    this.subscribe('uploaded-files', function(){
        return [[page.getReactively('profileImageId'), page.getReactively('coverPhotoId')]];
    });
    
    // Reactive helpers
    this.helpers({
        /**
         * Image file
         */
        image: function(){
            var profileImageId = page.getReactively('profileImageId');
            if (!profileImageId) {
                return;
            }
            return UploadedFile.findOne({_id: profileImageId });
        },
        
        /**
         * Cover photo
         */
        coverPhoto: function(){
            var coverPhotoId = page.getReactively('coverPhotoId');
            if (!coverPhotoId){
                return;
            }
            return UploadedFile.findOne({_id: coverPhotoId });
        },
        
        /**
         * Check for processing errors
         */
        processError: function(){
            var image = page.getReactively('image');
            if (image && image.processError) {
                return true;
            }
            return false;
        }
    });
    
    page.profileStats = null;
    api("profile.stats", {}).then((stats)=>{
        page.profileStats = stats;
    });

    page.birthdayOptions = {
        maxDate: new Date(),
        minDate: new Date(1900, 1, 1),
        datepickerMode: 'year'
    };
    
    if (!$rootScope.currentUser.profile.bandSettings) {
        $rootScope.currentUser.profile.bandSettings = {
            public: true
        };
    }
    
    /**
     * Save profile changes
     */
    page.saveProfile = function(){
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        }).then(function(){
            notify.success("You have successfully updated your profile.");
        }).catch(error);
    };
    
    /**
     * Upload profile image
     */
    page.uploadProfileImage = function(){
        uploader.uploadFiles({
            title: "Choose Your Profile Photo",
            type: "image/*",
            process: "profileImage"
        }).then(function(image){
            if (image) {
                page.profileImageId = image._id;
                $rootScope.currentUser.profile.image = image.url;
            }
        });
    };
    
    /**
     * Upload cover photo
     */
    page.uploadCoverPhoto = function(){
        uploader.uploadFiles({
            title: "Upload Your Cover Photo",
            type: "image/*",
            process: "coverPhoto"
        }).then(function(image){
            if (image) {
                page.coverPhotoId = image._id;
                $rootScope.currentUser.profile.coverPhoto = image.url;
            }
        });
    };
    
    /**
     * Enable brand mode for the user
     */
    page.enableBandMode = function(){
        api('profile.enableBandMode', {}).catch(error);
    };

    /**
     * show Referral dialog
     */
    $scope.showReferralDialog = function () {
        dialog.show('referral', {size: 'lg'});
        $('.popover').remove();
    };
    
    /**
     * Update image URL with the resized cnd url
     */
    $scope.$watch('page.image.process.url', function(url){
        if (url){
            $rootScope.currentUser.profile.image = url;
            page.saveProfile();
            page.profileImageId = null;
        }
    });
    
    /**
     * Update image URL with the resized cdn url
     */
    $scope.$watch('page.coverPhoto.process.url', function(url){
        if (url){
            $rootScope.currentUser.profile.coverPhoto = url;
            page.saveProfile();
            page.coverPhotoId = null;
        }
    });
    
    /**
     * Listen for process errors
     */
    $scope.$watch('page.processError', function(err){
        if (err){
            page.profileImageId = null;
            page.coverPhotoId = null;
            error("An error occured while processing your uploaded image. Please try again!");
        }
    });
    
    $scope.$watch('$root.currentUser.profile.dateOfBirth', function(dateOfBirth){
        if (typeof(dateOfBirth) === 'string'){
            $scope.$root.currentUser.profile.dateOfBirth = new Date(dateOfBirth);
        }
    });
});