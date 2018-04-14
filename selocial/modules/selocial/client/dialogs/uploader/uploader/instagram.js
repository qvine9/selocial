/**
 * Uploader dialog controller
 */
angular.module('selocial').controller('instagramUploaderController', function($scope, error, api){
    
    this.photos = [];
    
    /**
     * Connect Facebook account
     */
    this.connect = ()=>{
        Meteor.linkWithInstagram({}, error);
    };
    
    $scope.$watch('$root.currentUser.services.instagram', (instagram)=>{
        if (instagram){
            api('social.getInstagramPhotos', {}).then((photos) => {
                this.photos = photos;
            });
        }
    });
    
    
    
});
    