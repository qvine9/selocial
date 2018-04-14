import angular from 'angular';

angular.module('admin').directive('collapseNav', function () {
    var directive = {
        restrict: 'A',
        link: link
    };

    return directive;

    function link(scope, ele, attrs) {
        var $a, $aRest, $app, $lists, $listsRest, $nav, $window, Timer, prevWidth, slideTime, updateClass;

        slideTime = 250;

        $window = $(window);

        $lists = ele.find('ul').parent('li');

        $lists.append('<i class="fa fa-angle-down icon-has-ul-h"></i>');

        $a = $lists.children('a');
        $a.append('<i class="fa fa-angle-down icon-has-ul"></i>');

        $listsRest = ele.children('li').not($lists);

        $aRest = $listsRest.children('a');

        $app = $('#app');

        $nav = $('#nav-container');

        $a.on('click', function(event) {
            var $parent, $this;
            if ($app.hasClass('nav-collapsed-min') || ($nav.hasClass('nav-horizontal') && $window.width() >= 768)) {
                return false;
            }
            $this = $(this);
            $parent = $this.parent('li');
            $lists.not($parent).removeClass('open').find('ul').slideUp(slideTime);
            $parent.toggleClass('open').find('ul').stop().slideToggle(slideTime);
            event.preventDefault();
        });

        $aRest.on('click', function(event) {
            $lists.removeClass('open').find('ul').slideUp(slideTime);
        });

        scope.$on('nav:reset', function(event) {
            $lists.removeClass('open').find('ul').slideUp(slideTime);
        });

        Timer = void 0;

        prevWidth = $window.width();

        updateClass = function() {
            var currentWidth;
            currentWidth = $window.width();
            if (currentWidth < 768) {
                $app.removeClass('nav-collapsed-min');
            }
            if (prevWidth < 768 && currentWidth >= 768 && $nav.hasClass('nav-horizontal')) {
                $lists.removeClass('open').find('ul').slideUp(slideTime);
            }
            prevWidth = currentWidth;
        };

        $window.resize(function() {
            var t;
            clearTimeout(t);
            t = setTimeout(updateClass, 300);
        });

    }
});