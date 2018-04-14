angular.module('selocial')

/**
 * Convert milisec duration to human readable format
 */
.filter('duration', function(){
    return function(x){
        // Hours
        var str = '';
        if (x > 3600) {
            var hours = Math.floor(x / 3600);
            str += hours + ':';
            x -= 3600 * hours;
        }
        var minutes = Math.floor(x / 60);
        str += (str ? ('0' + minutes).substr(-2) : minutes) + ':';
        x = x - 60 * minutes;
        str += ('0' + x).substr(-2);
        return str;
    };
});