import angular from 'angular';

angular.module('admin').directive('highlightActive', function() {
    var directive = {
        restrict: 'A',
        controller: [ '$scope', '$element', '$attrs', '$location', highlightActiveCtrl]
    };

    return directive;

    function highlightActiveCtrl($scope, $element, $attrs, $location) {
        var highlightActive, links, path;

        links = $element.find('a');

        path = function() {
            return $location.path();
        };

        highlightActive = function(links, path) {
            path = '#' + path;
            return angular.forEach(links, function(link) {
                var $li, $link, href;
                $link = angular.element(link);
                $li = $link.parent('li');
                href = $link.attr('href');
                if ($li.hasClass('active')) {
                    $li.removeClass('active');
                }
                if (path.indexOf(href) === 0) {
                    return $li.addClass('active');
                }
            });
        };

        highlightActive(links, $location.path());

        $scope.$watch(path, function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            return highlightActive(links, $location.path());
        });

    }

});