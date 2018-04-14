/**
 * Uploader dialog controller
 */
angular.module('selocial').controller('facebookUploaderController', function($scope, $reactive, error){
    $reactive(this).attach($scope);
    
    /**
     * Connect Facebook account
     */
    this.connect = ()=>{
        Meteor.linkWithFacebook({
            requestPermissions: ['user_friends', 'user_photos']
        }, error);
    };
    
    
    this.helpers({
        
        images: ()=>{
            var facebook = $scope.getReactively('$root.currentUser.services.facebook');
            if (facebook) {
                return FacebookCollections.getPhotos("me",100).find();
            }
        },
        
        photos: ()=>{
            var images = $scope.getCollectionReactively('facebook.images');
            if (images){
                return images.map(function(image){
                    return {url: image.images[0].source};
                });
            }
        }
        
    });
    
});
    