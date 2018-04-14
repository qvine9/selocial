/**
 * Uploader dialog controller
 */
angular.module('selocial').controller('fileUploaderController', function($scope, Upload, api, $q, error, $reactive, $timeout){
    
    $reactive(this).attach($scope);
    
    var params = $scope.dlg.params;
    $scope.files = null;
    
    /**
     * Send file list as the dialog result
     */
    var sendFiles = function(files){
        $timeout(function(){
            $scope.$close(files);
        }, 600);
    };
    
    /**
     * Upload files
     */
    $scope.uploadFiles = function(files){
        $scope.files = files;
        if (files && files.length) {
            $scope.dlg.processingFiles = true;
            var promises = [],
                uploadedFiles = [];
            for (var i = 0; i < files.length; i++) {
                (function(i, file){
                    promises.push($q(function(resolve){
                        Upload.upload({
                            url: '/upload', 
                            data: {
                                file: file,
                                process: params.process,
                                trackId: params.trackId,
                                isTrack: params.isTrack
                            }
                        }).then(function (resp) {
                            if (resp.data.error || (resp.data.files && resp.data.files[0] && resp.data.files[0].error)){
                                error(resp.data.error);
                                return resolve("");
                            }
                            uploadedFiles[i] = resp.data.files[0];
                            api('file.setPriority', {fileId: uploadedFiles[i]._id, priority: i});
                            resolve(resp.data.files[0]);
                        }, function (resp) {
                            error(resp);
                            resolve();
                        }, function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            $scope.files[i].percent = progressPercentage;
                            if (progressPercentage > 99) {
                                $scope.files[i].showIndeterinateProgress = true;
                            }
                        });
                    }));
                })(i, files[i]);
            }
            $q.all(promises).then(function(){
                if (params.multiple){
                    var realUploadedFiles = [];
                    _.each(uploadedFiles, function(f){
                        realUploadedFiles.push(f);
                    });
                    return sendFiles(realUploadedFiles);
                } else if (uploadedFiles.length) {
                    var ret;
                    _.each(uploadedFiles, function(f){
                        ret = sendFiles(f);
                    });
                    return ret;
                }
                sendFiles();
            });
        }
    };
    
    /**
     * Upload a single file
     */
    $scope.uploadFile = function(file){
        $scope.uploadFiles([file]);
    };

});