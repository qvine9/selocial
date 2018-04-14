/**
 * Uploader dialog controller
 */
angular.module('selocial').controller('remoteUploadDialogController', function($scope, params, api, error){
    
    api('media.remoteUpload', params).then(function(file){
        $scope.$close(file);
    }).catch(function(err){
        error(err);
        $scope.$close();
    })
    
});