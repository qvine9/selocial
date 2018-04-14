/**
 * Justified images
 */
angular.module('selocial').directive('justifiedGallery', function () {
    return {
        restrict: 'A',
        scope: {
            images: "=justifiedGallery",
            justifiedParams: "=",
            adjustParent: '=',
            onClick: '&'
        },
        templateUrl: 'modules/selocial/client/components/justifiedGallery/justifiedGallery.html',
        link: function (scope, el, attrs) {
            var isInitialized = false;
            var params = scope.justifiedParams || {};
            var zoom = 1;
            
            el.on('click', 'img', function(){
                var url = $(this).attr('src');
                safeApply(scope, function(){
                    scope.onClick({url: url});
                });
            });
            
            var adjustParent = function(){
                if (scope.images && scope.images.length && scope.adjustParent){
                    var height = el.height(),
                        parentHeight = el.parent().height();
                    if (height < parentHeight) {
                        zoom += 0.25;
                        el.parent().css('zoom', zoom);
                        setTimeout(adjustParent, 10);
                    }
                }
            };
            
            scope.$watch("images.length", function(){
                setTimeout(function(){
                    if (!isInitialized) {
                        isInitialized = true;
                        
                        var rowHeight;
                        switch(scope.images.length){
                            case 1: rowHeight = 250; break;
                            case 2: rowHeight = 250; break;
                            case 3: rowHeight = 100; break;
                            case 4: rowHeight = 100; break;
                            default: rowHeight = 50;
                        }
                        
                        var jg = $(el).justifiedGallery(_.extend({
                            rowHeight: rowHeight,
                            maxRowHeight: '120%',
                            sort: function(a,b){
                                return Math.round(Math.random() * 3) - 1;
                            },
                            lastRow: 'justify',
                            captions: false,
                            margins: 0,
                            border: 0,
                            refreshTime: 1000,
                            justifyThreshold: 0.85
                        }, params));
                        
                        if ($(window).width() >= 768){
                            var refresh = function(){
                                $(el).justifiedGallery();
                                adjustParent();
                                setTimeout(refresh, Math.round(Math.random() * 10000) + 6000);
                            };

                            setTimeout(refresh, Math.round(Math.random() * 5000) + 4000);
                        }
                    } else {
                        $(el).justifiedGallery('norewind');
                        var w = $(el).width();
                        setTimeout(function(){
                            $(el).css({width: (w-1)+'px'});
                            
                            setTimeout(function(){
                                $(el).css({width: 'auto'});
                                adjustParent();
                            }, 1100);
                            
                            adjustParent();
                        }, 100);
                    }
                    
                    adjustParent();
                }, 100);
            });
            
            scope.$on('$destroy', function(){
                if (isInitialized) {
                    $(el).justifiedGallery('destroy');
                }
            });
        }
    };
});