/**
 * Typing simulation directive
 */
angular.module('selocial').directive('textScroller', function(){
    return {
        restrict: 'A',
        scope: {
            textScroller: '=',
            textScrollerLength: '='
        },
        link: function (scope, el, attr) {
            
            var $container = el,
                $scroller = $('.scrolling-text-content', el),
                itemId = 0,
                offsetLeft = 0,
                scrollTimeout = null;
            
            scope.$watch('textScroller', function(textScroller){
                if (textScroller && textScroller.length){
                    restart();
                }
            });
            
            
            var next = function(){
                if (itemId >= (scope.textScrollerLength || scope.textScroller.length)){
                    return restart(true);
                }
                var width = $($scroller.children().get(itemId)).width();
                offsetLeft += width;
                $scroller.css({transform: 'translateX(-'+offsetLeft+'px)'})
                itemId++;
                scrollTimeout = setTimeout(next, 5000);
            };
            
            
            var restart = function(instant){
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                $container.removeClass('animate');
                $scroller.css({transform: 'translateX(0)'});
                setTimeout(function(){
                    $container.addClass('animate');
                }, 1);
                itemId = 0;
                offsetLeft = 0;
                if (instant){
                    next();
                } else {
                    scrollTimeout = setTimeout(next, 3000);
                }
            };
            
        }
    };
});
