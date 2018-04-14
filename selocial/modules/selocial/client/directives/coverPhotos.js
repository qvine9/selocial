/**
 * Cover photos
 */
angular.module('selocial').directive('coverPhotos', function(api, $filter){
    return {
        restrict: 'A',
        scope: {
            mix: '=',
            images: '=coverPhotos'
        },
        link: function (scope, el, attr) {
            if (scope.mix.cover && !/updatecover/.test(location.href)){
                el.css({
                    backgroundImage: 'url('+$filter('safeUrl')(scope.mix.cover)+')',
                    backgroundSize: 'cover'
                });
                return;
            }
            
            var imagesToLoad = 0,
                loadedImages = [];
            
            el.html('<span class="spinner"></span>');
            
            /**
             * Check if all images have been loaded, place them to best fill the available space
             */
            var checkAndPlace = function(){
                if (imagesToLoad === 0){
                    el.html('<canvas></canvas>');
                    var $canvas = $('canvas', el),
                        canvas = $canvas.get(0),
                        context = canvas.getContext('2d');
                    
                    var containerWidth = el.width() * 2,
                        containerHeight = el.height() * 2,
                        images = [];
                
                    canvas.width = containerWidth;
                    canvas.height = containerHeight;
                    $canvas.css({'width': '100%', 'height': '100%'});
                
                    _.each(loadedImages, function(img){
                        var image = {
                            element: img,
                            ratio: img.width / img.height
                        };
                        images.push(image);
                    });
                    images.sort(function(a,b){ return a.ratio - b.ratio; });
                    
                    // Now we have a list of optimal image sizes.
                    // Let's put the narrowest images next to the ones in the middle.
                    // At most 2 images may be in the same line
                    var idx = 0,
                        currentImage,
                        totalHeight = 0,
                        imagePositions = [];
                    while (images.length > 0){
                        var image = images[idx];
                        images.splice(idx, 1);
                        if (currentImage) {
                            // Add pair
                            
                            if (image.element.height < currentImage.element.height){
                                image.height = currentImage.element.height;
                                image.width = image.height / image.element.height * image.element.width;
                                currentImage.height = currentImage.element.height;
                                currentImage.width = currentImage.element.width;
                            } else {
                                currentImage.height = image.element.height;
                                currentImage.width = currentImage.height / currentImage.element.height * currentImage.element.width;
                                image.height = image.element.height;
                                image.width = image.element.width;
                            }
                            var totalWidth = currentImage.width + image.width;
                            var ratio = containerWidth / totalWidth;
                            
                            imagePositions.push({
                                image: image.element,
                                x: 0,
                                y: totalHeight,
                                w: ratio * image.width, 
                                h: ratio * image.height
                            });
                            
                            imagePositions.push({
                               image: currentImage.element,
                               x: ratio * image.width, 
                               y: totalHeight, 
                               w: ratio * currentImage.width, 
                               h: ratio * currentImage.height
                            });
                            
                            totalHeight += ratio * image.height;
                            
                            currentImage = null;
                        } else if (images.length) {
                            // Set currentImage
                            currentImage = image;
                        } else {
                            // Add last image
                            var imageHeight = containerWidth / image.element.width * image.element.height;
                            
                            imagePositions.push({
                                image: image.element,
                                x: 0, 
                                y: totalHeight, 
                                w: containerWidth, 
                                h: imageHeight
                            });
                            
                            totalHeight += imageHeight;
                        }
                        idx = Math.floor(images.length / 2);
                    }
                    
                    ratio = 1;
                    if (totalHeight < containerHeight){
                        ratio = containerHeight / totalHeight;
                    }
                    
                    for (var iid = 0; iid < imagePositions.length; iid++){
                        context.drawImage(
                            imagePositions[iid].image, 
                            imagePositions[iid].x * ratio, 
                            imagePositions[iid].y * ratio, 
                            imagePositions[iid].w * ratio, 
                            imagePositions[iid].h * ratio);
                    }
                    
                    var imageUrl = canvas.toDataURL("image/png");
                    $canvas.remove();
                    el.css({
                        backgroundImage: 'url('+imageUrl+')',
                        backgroundSize: 'cover'
                    });
                    
                    api('mix.saveCover', {mixId: scope.mix._id, image: imageUrl});
                }
            };
            
            scope.$watchCollection('images', function(images){
                if (images && images.length){
                    
                    imagesToLoad = images.length;
                    loadedImages = [];
                    
                    _.each(images, function(image){
                        
                        var img = new Image();
                        img.crossOrigin = "Anonymous";
                        img.onload = function(){
                            imagesToLoad--;
                            loadedImages.push(img);
                            checkAndPlace();
                        };
                        img.onerror = function(){
                            setTimeout(function(){
                                var img = new Image();
                                img.crossOrigin = "Anonymous";
                                img.onload = function(){
                                    imagesToLoad--;
                                    loadedImages.push(img);
                                    checkAndPlace();
                                };
                                img.onerror = function(){
                                    imagesToLoad--;
                                    checkAndPlace();
                                };
                                img.src = $filter('safeUrl')((image.process && image.process.thumbnailUrl) || image.url);
                            }, 5000);
                        };
                        img.src = $filter('safeUrl')((image.process && image.process.thumbnailUrl) || image.url);
                    });    
                }
            });
            
        }
    };
});
