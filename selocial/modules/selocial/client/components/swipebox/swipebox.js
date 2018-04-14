angular.module('selocial')

/**
 * Swipebox component
 */
.directive('swipebox', function(){
    return {
        restrict: 'A',
        templateUrl: 'modules/selocial/client/components/swipebox/swipebox.html',
        
        scope: {
            images: '=swipebox'
        },
        
        link: function(scope, element, attr){
            
            scope.$watch('images.length', function(l){
                if (l){
                    setTimeout(function(){
                        var mySwiper = new Swiper($('.swiper-container', element), {
                            speed: 250,
                            spaceBetween: 10,
                            autoplay: 4000,
                            keyboardControl: true,
                            grabCursor: true,
                            loop: true,
                            effect: 'slide',
                            followFinger: false,
                            autoplayDisableOnInteraction: false
                        });   
                        
                        $('.swiper-button-prev', element).click(function(){
                            mySwiper.slidePrev();
                        });
                        
                        $('.swiper-button-next', element).click(function(){
                            mySwiper.slideNext();
                        });
                        
                    }, 500);
                }
            });
            
        }
    };
});