/**
 * Panels that fill the #content vertically
 */
angular.module('selocial').directive('verticalFillPanel', function(){
    return {
        restrict: 'A',
        link: function(scope, el, attrs){
            
            var diff = parseInt(attrs.verticalFillPanel) || 0;
            
            /**
             * Resize handler
             */
            function onResize(){
                var $container = $(window),
                    css;
                var widthLimit = (parseInt(attrs.widthLimit) || 992);
                if ((widthLimit > 0 && $container.width() < widthLimit) || (widthLimit < 0 && $container.width() > -widthLimit)) {
                    css = { margin: '' };
                    css[attrs.heightProperty || 'minHeight'] = '';
                } else {
                    var height = $container.height() - 185 - diff;
                    css = { margin: 0 };
                    css[attrs.heightProperty || 'minHeight'] = height;
                }
                el.css(css);
            }
            
            $(window).bind('resize', onResize);
            
            scope.$on('$destroy', function(){
                $(window).unbind('resize', onResize);
            });
            
            onResize();
        }
    };
});