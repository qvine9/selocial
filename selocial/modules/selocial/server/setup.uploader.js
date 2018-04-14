const md5File = require('md5-file');
const fs = require('fs');

/**
 * Set up file upload server
 */
Meteor.startup(function () {

    var uploadPath = config.media.uploadPath;
    
    var hash;
    UploadServer.init({
        tmpDir: uploadPath + '/tmp',
        uploadDir: uploadPath + '/',
        uploadUrl: '/upload/',
        checkCreateDirectories: true,
        maxPostSize: 500000000,
        maxFileSize: 500000000,
        getFileName: function(fileInfo, formData) {
            fileInfo.originalName = fileInfo.name;
            var name = fileInfo.type.replace(/\/.*/, '') + '-' 
            + (new Date().getTime()) + '-' + Math.floor(Math.random() * 1000000) 
            + fileInfo.originalName.replace(/.*(\..*)$/, '$1');
            fileInfo.url = Meteor.absoluteUrl() + "upload/" + name;
            fileInfo._id = formData.process + hash + config.media.fileProcessorVersion;
            return name;
        },
        validateFile: function(fileInfo) {
            hash = md5File.sync(fileInfo.path);
            return null;
        },
        finished: function(fileInfo, formFields) {
            //duplicate detection
            if (UploadedFile.findOne({ _id: fileInfo._id })) {
                //yeah, the file was uploaded in the past
                UploadedFile.update({ _id: fileInfo._id }, {$set: {
                    name: fileInfo.name,
                    path: fileInfo.path,
                    size: fileInfo.size,
                    type: fileInfo.type,
                    baseUrl: fileInfo.baseUrl,
                    originalName: fileInfo.originalName
                }});
                console.log(fileInfo);
            } else {
                UploadedFile.insert(fileInfo);
            }
            console.log("FormFields:");
            console.log(formFields);
            MediaConverter.process(fileInfo, formFields.process, formFields.trackId, formFields.isTrack);
        },
        cacheTime: 0
    });
    //just in case. 
    //at some certain conditions it must be here
    // fs.mkdirSync(uploadPath);
    // fs.mkdirSync(uploadPath + '/tmp'); 
});

/**
 * Publish uploaded files by ids
 */
Meteor.publish('uploaded-files', function(ids){
    if(!ids || ids.length === 0) {
        return;
    }
    return UploadedFile.find({_id: {$in: ids}});
});
