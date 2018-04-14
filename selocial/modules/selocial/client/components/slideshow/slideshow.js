angular.module('selocial').directive('slideshow', function($filter){
    return {
        restrict: 'A',
        templateUrl: 'modules/selocial/client/components/slideshow/slideshow.html',
        scope: {
            slideshow: '='
        },
        link: function(scope, element, attr){
            
            var $mediaCover = $('.media-cover', element),
                imageIndex = 0,
                interval = 3000,
                isSlideshowEnabled = null,
                shouldPreload = true;
                
            function getSlideshowImage(imageIndex){
                return scope.slideshow[imageIndex].process && scope.slideshow[imageIndex].process.url || scope.slideshow[imageIndex].url;
            }
            
            function stepImage(){
                if (!isSlideshowEnabled) return;
                
                var imageUrl = scope.slideshow[imageIndex] 
                        ? 'url(\''+ $filter('safeUrl')( getSlideshowImage(imageIndex) ) +'\')'
                        : 'none';
                
                $mediaCover.css({backgroundImage: imageUrl});
                imageIndex++;
                
                // preload next image
                if (!scope.slideshow[imageIndex]){
                    imageIndex = 0;
                    shouldPreload = false;
                }
                if (shouldPreload){
                    var img = new Image();
                    img.onload = function(){
                        setTimeout(stepImage, interval);
                    };
                    img.src = $filter('safeUrl')(getSlideshowImage(imageIndex));
                } else {
                    setTimeout(stepImage, interval);
                }
            }
            
            scope.$on('$destroy', function(){
                isSlideshowEnabled = false;
            });
            
            scope.$watch('slideshow', function(images){
                if (images && images.length){
                    if (isSlideshowEnabled) return;
                    isSlideshowEnabled = true;
                    stepImage();
                }
            });
        
        }
    }
});