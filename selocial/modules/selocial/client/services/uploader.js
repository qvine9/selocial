/**
 * Upoader service
 */
angular.module('selocial').service('uploader', function(dialog, $q){
    return {
        
        /**
         * Show the file picker dialog
         * 
         * @param {object} options
         * @returns {promise}
         */
        uploadFiles: function(options){
            return $q(function(resolve, reject){
                var defaultOptions = {
                    title: 'Upload Files',
                    multiple: false,
                    type: '*/*'
                };
                dialog.show("uploader", angular.extend(defaultOptions, options), {
                    size: "md"
                }).then(resolve).catch(reject);
            });
        }
        
    };
});