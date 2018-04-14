import angular from 'angular';

/**
 * Angular Material config
 */
angular.module('core').config(function($mdThemingProvider){ 
    'ngInject';

    var cyan = $mdThemingProvider.extendPalette("cyan",{
        contrastLightColors:"500 600 700 800 900",
        contrastStrongLightColors:"500 600 700 800 900"
    });
    
    var lightGreen = $mdThemingProvider.extendPalette("light-green",{
        contrastLightColors:"500 600 700 800 900",
        contrastStrongLightColors:"500 600 700 800 900"
    });
    
    var cyanAlt = $mdThemingProvider
        .definePalette("cyanAlt", cyan)
        .definePalette("lightGreenAlt", lightGreen);
    
    $mdThemingProvider.theme("default")
        .primaryPalette("light-green",{"default":"700"})
        .accentPalette("cyanAlt",{"default":"700"})
        .warnPalette("red",{"default":"500"})
        .backgroundPalette("grey");

});