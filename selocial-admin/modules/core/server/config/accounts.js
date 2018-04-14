Accounts.emailTemplates.from = "selocial <info@selocial.com>";

/**
 * Callback when an account is created
 */
Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile || {};
    
    user.profile.name = options.name || user.username || options.username;
    user.username = user.username || options.username || 'user' + (new Date().getTime());
    
    return user;
});
