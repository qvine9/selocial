import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularMeteorAuth from 'angular-meteor-auth';
import angularAnimate from 'angular-animate';
import angularAria from 'angular-aria';
import angularMessages from 'angular-messages';
import angularSanitize from 'angular-sanitize';
import angularMaterial from 'angular-material';
import angularUiRouter from 'angular-ui-router';
import angularUiBootstrap from 'angular-ui-bootstrap';
import angularUiGrid from 'angular-ui-grid';

angular.module('core', [
    angularMeteor,
    angularMeteorAuth,
    angularAnimate,
    angularAria,
    angularMessages,
    angularSanitize,
    angularMaterial,
    angularUiRouter,
    angularUiBootstrap,
    'ui.grid',
    'ui.grid.resizeColumns',
    'ui.grid.exporter',
    'ui.grid.autoResize',
    'admin'
])

.run(function($rootScope, $state, notify, auth){ 
    'ngInject';
    
    $rootScope.$state = $state;
    $rootScope.auth = auth;
    
    $rootScope.$on('errorMessage', function(event, error){
        notify.error(error);
    });
    
    $rootScope.$on("login", function(){
        $state.reload();
    });
    
    $rootScope.$on("logout", function(){
        $state.go('admin.login');
    });
    
    $rootScope.$on('$stateChangeSuccess', function(){
        $('#loader').hide();
    });
    
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
        switch (error){
            case 'AUTH_REQUIRED':
                return $state.go("admin.login");
            case 'GUEST_ONLY':
                return $state.go("admin.dashboard");
            case 'NO_WEBSITE':
                return $state.go('admin.dashboard');
            default:
                console.error(error);
        }
    });
    
});