/**
 * Typing simulation directive
 */
angular.module('selocial').directive('typer', function(){
    return {
        restrict: 'A',
        link: function (scope, el, attr) {

            if ($(window).width() < 680) return;

            var wordList = attr.typer.split(','),
                wordIndex = 0, 
                isDeleting = true;

            var interval = setInterval(function(){
                var switchFn = function(){
                    var txt = el.text();
                    if (isDeleting){
                        if (txt.length === 1) {
                            isDeleting = false;
                            wordIndex++;
                            if (wordIndex >= wordList.length) {
                                wordIndex = 0;
                            }
                            txt = '';
                        } else {
                            el.text(txt.substring(0, txt.length-1));
                            setTimeout(switchFn, 100);
                        }
                    }
                    if (!isDeleting){
                        txt += wordList[wordIndex][txt.length];
                        el.text(txt);
                        if (txt.length < wordList[wordIndex].length) {
                            setTimeout(switchFn, 100);
                        } else {
                            isDeleting = true;
                        }
                    }
                };
                switchFn();
            }, 5500);

            scope.$on('$destroy', function(){
                clearInterval(interval);
            });

        }
    };
});
