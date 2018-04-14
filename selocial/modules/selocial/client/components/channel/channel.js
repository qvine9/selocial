angular.module('selocial')

/**
 * Channel component
 */
.directive('channel', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/channel/channel.html',
        controllerAs: 'channel',
        
        scope: {
            title: "@",
            mixStream: "="
        },
        
        link: function(scope, el){
            
            var loadingLock = false;
            $('stream.panel').scroll(function(e){
                var windowWidth = $(window).width(),
                    panelWidth = scope.mixStream.loadedMixIds ? scope.mixStream.loadedMixIds.length * 230 : 0,
                    scrollLeft = $(this).scrollLeft();
                
                if (windowWidth < panelWidth) {
                    if (panelWidth - windowWidth - scrollLeft < 230 * 4) {
                        if (!loadingLock){
                            loadingLock = true;
                            setTimeout(function(){
                                loadingLock = false;
                            }, 1000);
                            safeApply(scope, function(){
                                scope.mixStream.loadNextPage();
                            });
                        }
                    }
                }
            });
            
        },
        
        
        
        /**
         * Channel component controller
         */
        controller: function(){
            
        }
    };
});