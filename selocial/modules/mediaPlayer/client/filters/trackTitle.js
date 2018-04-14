angular.module('mediaPlayer')

/**
 * Track title filter
 */
.filter('trackTitle', function(){
    return function(text){
        if (text){
            text = text.replace('[SoundCloud]', '<span class="soundcloud-logo"></span>');
        }
        return text;
    };
});
    