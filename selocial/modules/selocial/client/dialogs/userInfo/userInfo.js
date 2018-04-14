/**
 * Track Info dialog controller
 */
angular.module('selocial').controller('userInfoDialogController', function($rootScope, $scope, $reactive, uploader, api, error, notify, $timeout){
    
    $reactive(this).attach($scope);
    
    $timeout(function(){
        $rootScope.currentUser.profile || ($rootScope.currentUser.profile = {});
        $rootScope.currentUser.profile.name || (!/^user/.test($rootScope.currentUser.username) && ($rootScope.currentUser.profile.name = $rootScope.currentUser.username));
    }, 500);
    
    var dlg = this;
    
    // Subscribe to video file
    this.subscribe('uploaded-files', function(){
        return [[dlg.getReactively('profileImageId')]];
    });
    
    // Reactive helpers
    this.helpers({
        /**
         * Image file
         */
        image: function(){
            var profileImageId = dlg.getReactively('profileImageId');
            if (!profileImageId) {
                return;
            }
            return UploadedFile.findOne({_id: profileImageId });
        },
        
        /**
         * Check for processing errors
         */
        processError: function(){
            var image = dlg.getReactively('image');
            if (image && image.processError) {
                return true;
            }
            return false;
        }
    });
    
    /**
     * Save profile changes
     */
    dlg.saveProfile = function(close){
        api('profile.update', {
            profile: $rootScope.currentUser.profile
        }).then(function(){
            notify.success("You have successfully updated your profile.");
            if (close){
                $scope.$close();
            }
        }).catch(error);
    };
    
    /**
     * Upload profile image
     */
    dlg.uploadProfileImage = function(){
        uploader.uploadFiles({
            title: "Choose Your Profile Photo",
            type: "image/*",
            process: "profileImage"
        }).then(function(image){
            if (image) {
                dlg.profileImageId = image._id;
                $rootScope.currentUser.profile.image = image.url;
            }
        });
    };
    
    /**
     * Update image URL with the resized cdn url
     */
    $scope.$watch('dlg.image.process.url', function(url){
        if (url){
            $rootScope.currentUser.profile.image = url;
            dlg.saveProfile();
            dlg.profileImageId = null;
        }
    });
    
    /**
     * Listen for process errors
     */
    $scope.$watch('dlg.processError', function(err){
        if (err){
            dlg.profileImageId = null;
            error("An error occured while processing your uploaded image. Please try again!");
        }
    });
   

});