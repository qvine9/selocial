angular.module('admin').directive('gridResizer', function(gridUtil, uiGridConstants) {
    return {
        restrict: 'A',
        require: 'uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
            $scope.$watch($attrs.uiGrid + '.minRowsToShow', function(val){
                var grid = uiGridCtrl.grid;

                // Initialize scrollbars (TODO: move to controller??)
                uiGridCtrl.scrollbars = [];

                // Figure out the new height
                var contentHeight = grid.options.minRowsToShow * grid.options.rowHeight;
                var headerHeight = grid.options.hideHeader ? 0 : grid.options.headerRowHeight;
                var footerHeight = grid.options.showFooter ? grid.options.footerRowHeight : 0;
                var columnFooterHeight = grid.options.showColumnFooter ? grid.options.columnFooterHeight : 0;
                var scrollbarHeight = grid.options.enableScrollbars ? gridUtil.getScrollbarWidth() : 0;
                var pagerHeight = grid.options.enablePagination ? gridUtil.elementHeight($elm.children(".ui-grid-pager-panel").height('')) : 0;

                var maxNumberOfFilters = 1;
                // Calculates the maximum number of filters in the columns
                var filterHeight = maxNumberOfFilters * headerHeight + 20;
                var newHeight = headerHeight + contentHeight + footerHeight + columnFooterHeight + scrollbarHeight + filterHeight + pagerHeight;

                $elm.css('height', newHeight + 'px');

                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

                // Run initial canvas refresh
                grid.refreshCanvas();
            });
        }
    };
});