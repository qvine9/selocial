angular.module('selocial')

/**
 * Invite component
 */
.directive('invite', function(){
    return {
        restrict: 'E',
        templateUrl: 'modules/selocial/client/components/referral/invite.html',
        
        scope: {
            modal: '@'
        },
        
        controllerAs: 'invite',
        /**
         * Referral Invite component controller
         */
        controller: function($scope, api, $reactive, $state){
            $reactive(this).attach($scope);

            this.ref = Referral.findOne();

            this.subscribe('my-referral', () => {
                this.ref = Referral.findOne();
            });

            this.helpers({
                referral: () => {
                    return $scope.getReactively('invite.ref');
                },
                referralLink: () => {
                    let ref = $scope.getReactively('invite.ref');
                    return ref ? $state.href('referral', {referralId: ref._id}, {absolute: true}) : null;
                }
            });


        }
    };
});