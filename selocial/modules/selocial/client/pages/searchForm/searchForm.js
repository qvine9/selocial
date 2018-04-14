/**
 * Settings page controller
 */
angular.module('selocial').controller('SearchFormPageController', function($state){
    
    this.keyword = '';
    
    /**
     * Search
     * 
     * @param {string} keyword
     */
    this.search = function(keyword){
        $state.go('search', {keyword: keyword});
    };
});