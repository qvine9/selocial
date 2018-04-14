angular.module('selocial').controller('App_LayoutController', function(uploader, $reactive, $scope, $state, notify, api){$reactive(this).attach($scope);

    this.copyrightYear = new Date().getFullYear();
    this.isNavbarOpen = false;
                                                                                                                         
                   // Subscribe to video file
    this.subscribe('uploaded-files', function(){
        return [[this.getReactively('videoId')]];
    });                                                                                                      

                             // Reactive helpers
    this.helpers({
        
        /**
         * Video file
         */
        video: function(){
            var id = this.getReactively('videoId');
            if (!id) {
                return;
            }
            return UploadedFile.findOne({_id: id });
        },
        
        /**
         * Check for processing errors
         */
        processError: function(){
            var video = this.getReactively('video');
            if (video && video.processError) {
                return true;
            }
            return false;
        }
    });
    // Show / hide loading screen based on connection state
    Tracker.autorun(function(){
        var status = Meteor.status();
        if (status.connected){
            setTimeout(function(){
                // Remove loading animation
                $('body').removeClass('loading');
            }, 500);
        } else {
            $('body').addClass('loading');
        }
    })

    $reactive(this).attach($scope);

    // Subscribe to user details
    this.subscribe('me', function(){ return [Meteor.userId()] });

    // Notifications
    this.helpers({
        notifications: function(){
            return Notification.find({
                userId: Meteor.userId()
            }, {
                sort: { date: -1 }
            });
        },

        unreadNotification: function(){
            return Notification.findOne({
                userId: Meteor.userId(),
                hasBeenDisplayed: {$ne: true}
            }, {
                sort: { date: 1 }
            });
        }
    });

    $scope.$on('$stateChangeSuccess', () => {
        this.hideNav();
    });

    /**
     * Toggle navigation
     */
    this.toggleNav = ()=>{
        this.isNavbarOpen = !this.isNavbarOpen;
    };

    /**
     * Hide navigation
     */
    this.hideNav = ()=>{
        this.isNavbarOpen = false;
    };

    this.resetNotificationCount = () => {
        api('profile.resetNotificationCount', {});
    };

    /** 
     * Upload Music
     */
    this.uploadMusic = function(){
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
                                                                                                                         
             /**
     * Upload video
     */
    this.uploadVideo = function(){
        uploader.uploadFiles({
            title: "Choose Video",
            type: "video/*",
            process: "mixVideo"
        }).then(function(video){
            if (video) {
                $state.go('createMix', {videoId: video._id});
            }
        });
    };
             
                                                                                                                         
    /**
     * Search
     */
    this.search = function(keyword){
        $state.go('search', {keyword: keyword});
    };

    $scope.$watch('app.isNavbarOpen', function(isNavbarOpen){
        if (isNavbarOpen){
            $('body').addClass('offcanvas');
        } else {
            $('body').removeClass('offcanvas');
        }
    });

    $scope.$watch('app.unreadNotification', function(unreadNotification){
        if (unreadNotification) {
            notify.info(unreadNotification.message);
            api('profile.readNotification', {notificationId: unreadNotification._id});
        }
    });
    
    this.getRole = function () {
        if(angular.isDefined($scope.currentUser.roles)){
            return 'band';
        }else{
            return 'notband';
        }
    }
    
});
