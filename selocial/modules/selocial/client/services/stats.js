angular.module('selocial').service('stats', ['$window', '$location', function($window, $location) {
        
    if ($window.ga){
        $window.ga('create', config.googleAnalyticsTrackingCode, 'selocial.com');
    }
        
    var StatisticsService = (function(){
        return {
            /**
             * Track a page view
             * 
             * @param {string} path
             */
            track: function(path) {
                if ($window.ga){
                    $window.ga('send', 'pageview', path || $location.path());
                }
            }
        };
    })();
    
    return StatisticsService;
}]);