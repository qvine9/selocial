angular.module('selocial').config(function($urlRouterProvider, $locationProvider, $stateProvider, $provide) {

    var routes = {
        home: { url: '/', role: 'guest' },
        referral: {
            url: '/referral/:referralId',
            role: 'guest',
            templateUrl: 'modules/selocial/client/pages/home/home.html',
            controller: 'HomePageController'
        },
        test: { url: '/test' },
        homeArtist: { url: '/for-artists', role: 'guest' },
        latest: { url: '/latest', role: '*' },
        notifications: { url: '/notifications', role: '*' },
        createMix: { url: '/create-mix/:mixId', role: '*' , params: {'mixId': null, 'videoId': null } },
        purchases: { url: '/purchases', role: '*' },
        payments: { url: '/payments', role: 'band' },
        myMusic: { url: '/my-music', role: 'band' },
            'myMusic.create': { url: '/create/:fileId', role: 'band' },
            'myMusic.track': { url: '/track/:trackId', role: 'band' },
        following: { url: '/following', role: '*' },
        followers: { url: '/followers', role: '*' },
        mostActive: { url: '/most-active' },
        settings: {
            url: '/settings',
            role: '*',
            controller: 'DashboardPageController',
            templateUrl: 'modules/selocial/client/pages/dashboard/dashboard.html'
        },
        dashboard: { url: '/dashboard', role: 'band' },
        searchForm: { url: '/search', role: '*' },
        search: { url: '/search/:keyword', role: '*' },
        resetPassword: { url: '/reset-password/:token', role: 'guest' },
        tag: { url: '/tag/:tag' },
        mix: { url: '/mix/:mixId' },
        docs: { url: '/docs/:id' },
        myAlbums: { url: '/my-albums', role: 'band'},
            'myAlbums.create': { url: '/createAlbum/:albumId', role: 'band' },
            'myAlbums.album': { url: '/album/:albumId', role: 'band' },


        channel: { url: '/:name' },

    };


    $urlRouterProvider.when('/embed-mix/:mixId', '/mix/:mixId');
    $urlRouterProvider.when('/embed-channel/:channelId', '/:channelId');
    $urlRouterProvider.when('/extremetechchallenge', '/Extreme%20Tech%20Challenge');
    $urlRouterProvider.otherwise('/');

    //--------------------------------------------------------------------------------

    $locationProvider.html5Mode(true);

    $provide.decorator('$uiViewScroll', function() {
        return function(uiViewElement) {
            $('#content-container').animate({scrollTop: 0}, 200);
        };
    });

    // Define application routes
    _.each(routes, function(routeConfig, routeName){
        if (typeof(routeConfig) === "string") {
            routeConfig = {
                url: routeConfig
            };
        }
        if (routeConfig.role){
            routeConfig.resolve || (routeConfig.resolve = {});
            routeConfig.resolve.currentUser = ['auth', function(auth){
                return routeConfig.role === 'guest'
                        ? auth.requireGuest()
                        : auth.requireRole(routeConfig.role);
            }];
        }
        routeConfig.templateUrl || (routeConfig.templateUrl = 'modules/selocial/client/pages/' + routeName + '/' + routeName + '.html');
        routeConfig.controller || (routeConfig.controller = routeName[0].toUpperCase() + routeName.substr(1).replace(/\./g, '_') + 'PageController');
        routeConfig.controllerAs || (routeConfig.controllerAs = 'page');
        $stateProvider.state(routeName, routeConfig);
    });
})
