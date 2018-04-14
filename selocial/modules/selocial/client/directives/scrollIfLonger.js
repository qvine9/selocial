/**
 * Typing simulation directive
 */
angular.module('selocial').directive('scrollIfLonger', function(){
    return {
        restrict: 'A',
        scope: {
            scrollIfLonger: '='
        },
        link: function (scope, el, attr) {
            
            var $scrollingText = $('.scrolling-text-content', el);
            
            var cleanUp = function(){
                $scrollingText.removeClass('animate-scroll');
                if ($scrollingText.children().length > 1){
                    _.each($scrollingText.children(), function(child, i){
                        if (i > 0){
                            child.remove();
                        }
                    });
                }
            };
            
            /**
             * Reset
             */
            var reset = function(){
                cleanUp();
                setTimeout(function(){
                    var continerWidth = el.outerWidth(),
                        dataWidth = $scrollingText.width(),
                        maxDiff = 90;
                        
                    if (dataWidth > continerWidth - maxDiff) {
                        var html = $scrollingText.html();
                        $scrollingText.append(html).append(html);
                        var duration = Math.floor(dataWidth / 50);
                        $scrollingText.addClass('animate-scroll');
                        $scrollingText.css({'animation-duration': duration + 's !important'});
                    }
                }, 100);
            };
            
            scope.$watch('scrollIfLonger', function(){
                reset();
            });
            
            var onResize = function(){
                cleanUp();
            };
            
            $(window).bind('resize', onResize);
            
            scope.$on('$destroy', function(){
                $(window).unbind('resize', onResize);
                cleanUp();
            });
            
            
            
        }
    };
});