/**
 * Uploader dialog controller
 */
angular.module('selocial').controller('uploaderDialogController', function($scope, params, $reactive, dialog){
    
    $reactive(this).attach($scope);
    
    this.params = params;
    this.processingFiles = false;
    
    /**
     * Upload a file from a remote URL
     * @param {string} url
     */
    this.remoteUpload = function(url){
        dialog.show('remoteUpload', {url: url, process: params.process}).then(function(file){
            if (file){
                $scope.$close([file]);
            }
        })
    };
    
});