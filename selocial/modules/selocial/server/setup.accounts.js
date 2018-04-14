/**
 * 3rd party authentication providers setup
 */

// Remove old configuration
ServiceConfiguration.configurations.remove({
    service: {$in: _.keys(config.authentication) }
});

// Set up authentication config for each provider
_.each(config.authentication, function(providerConfig, providerName){
    var serviceConfig = _.extend({ service: providerName }, providerConfig);
    ServiceConfiguration.configurations.insert(serviceConfig);
});

/**
 * Callback when an account is created
 */
Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile || {};
    
    if (user.services.facebook) {
        user.profile.name = user.services.facebook.name || user.profile || user.profile.name ||
        user.services || user.services.facebook || user.services.facebook.name || user.services.facebook.username;
    } else if (user.services.twitter) {
        user.profile.name = user.services.twitter.name || user.services.twitter.username || user.services.twitter.screenName;
        user.username = user.services.twitter.screenName || user.services.twitter.username || user.services.twitter.name;
    } else if (user.services.google) {
        user.profile.name = user.services.google.name;
    } else if (user.services.soundcloud) {
        user.profile.name = user.services.soundcloud.full_name || user.services.soundcloud.username;
    } else {
        user.profile.name = options.name || user.username || options.username;
    }
    
    user.username = (user.username || options.username || 'user' + (new Date().getTime())).replace(/[^a-zA-Z0-9]/g, '');
    user.timebankBalance = 15 * 60;
    
    if (options.bandMode || user.bandMode){
        user.timebankBalance += config.transaction.bandModeExtraTime;
        user.roles = ["band"];
    }

    if (options.referralId || user.referralId) {
        user.referralId = options.referralId;
    }
    
    return user;
});
