angular.module('selocial').directive('autofocus', function(){
    return {
        link: function(scope, element, attr){
            if (attr.autofocus !== 'false'){
                setTimeout(function(){
                    element.focus();
                }, 1000);
            }
        }
    }
});