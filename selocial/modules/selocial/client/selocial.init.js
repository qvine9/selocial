angular.module('selocial')

/**
 * Initialize the application
 */
.run(function($rootScope, $state , auth, notify, dialog, api, stats, $location, $window){
    
    $rootScope.$on('$stateChangeSuccess', function(){
        stats.track();
    });
    
    $rootScope.$state = $state;
    $rootScope.config = config;
    $rootScope.auth = auth;
    $rootScope.dialog = dialog;
    $rootScope.api = api;
    $rootScope.baseUrl = Meteor.absoluteUrl();
    
    // Handle state change errors
    $rootScope.$on("$stateChangeError", function(event, fromState, fromStateParams, toState, toStateParams, error){
        switch(error){
            case "FORBIDDEN":
                if (Meteor.userId()) {
                    $state.go('latest');
                } else {
                    $state.go('home');
                }
                break;
            case "UNAUTHENTICATED":
            case "GUEST_ONLY":
                $state.go('latest');
                break;
            case "AUTH_ONLY":
            default:
                $state.go('home');
                break;
        }
    });
    
    
    /**
     * Listen for errors
     */
    $rootScope.$on('selocial.errorMessage', function(event, error){
        notify.error(error);
    });
    
    /**
     * Listen for login
     */
    $rootScope.$on('selocial.login', function(){
        $state.go('latest');
        var $modal = $('.modal-body');
        if ($modal.length > 0){
            $modal.scope().$close();
        }

        var shownRefModal = false;
        $rootScope.subscribe('my-referral', null, () => {
            const ref = Referral.findOne(),
                today = moment(),
                lastPrompted = ref.lastPrompted ? moment(ref.lastPrompted) : moment().subtract(31, 'days');

            if (today.diff(lastPrompted, 'days') < 30 || shownRefModal)
                return;

            shownRefModal = true;
            dialog.show('referral', {size: 'lg'});
            Meteor.setTimeout(() => {
                api('referral.prompted', {referralId: ref._id});
            }, 2000);
        });
    });
    
    // Show popup to edit user details if a username is not set
    $rootScope.$watch('currentUser.username', function(username){
        if (username && (!$rootScope.currentUser.profile || !$rootScope.currentUser.profile.name)) {
            dialog.show('userInfo');
        }
    });
    
    
    /**
     * Listen for logout
     */
    $rootScope.$on('selocial.logout', function(){
        $state.go('home');
        setTimeout(function(){
            $state.go('home');
        }, 500);
    });
    
});