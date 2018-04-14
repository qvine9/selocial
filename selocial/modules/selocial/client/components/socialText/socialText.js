angular.module('selocial')

/**
 * Audio track component
 */
.directive('socialText', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/socialText/socialText.html',
        require: 'ngModel',
        
        scope: {
            placeholder: '@',
            autofocus: '=',
            onEnterPressed: '&',
            onFocus: '&'
        },
        
        /**
         * Link
         */
        link: function(scope, el, attrs, ngModel){
            
            ngModel.$render = function(){
                scope.text = ngModel.$viewValue;
            };
            
            scope.$watch('text', function(text){
                ngModel.$setViewValue(text);
            });
            
            el.bind("keydown", function (event) {
                if(event.which === 13) {
                    var $menu = $('mentio-menu'),
                        menu = $menu.length ? $menu.get(0) : null;
                    if (!menu || menu.style.display !== 'block') {
                        scope.$apply(function(){
                            scope.onEnterPressed();
                        });
                    }
                }
            });
            
        },

        /**
         * Social text component controller
         */
        controller: function($scope, api, $q){
            $scope.text = '';
            $scope.users = [];
            
            $scope.searchUsernames = function(name){
                $scope.users = _.pluck(User.find({username: {$regex: name, $options: 'i'}}).fetch(), 'username');
                return $q.when($scope.users);
            };

            $scope.getPeopleTextRaw = function(item) {
                return '@' + item;
            };
        }
    };
});