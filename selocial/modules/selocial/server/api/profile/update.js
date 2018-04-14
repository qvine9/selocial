Meteor.startup(function(){
    /**
     * Update the profile
     */
    Api.registerEndpoint('profile', 'update', {
        description: "Update profile",
        accessTokenRequired: true,
        params: {
            profile: {
                description: "Profile details"
            }
        },

        sample: {
            request: {
                profile: {
                    name: 'John'
                }
            },
            response: true
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var update = {$set: {
                    profile: params.profile
                }};

            if (params.profile.name && typeof(params.profile.name) === 'string'){
                var username = params.profile.name.replace(/[^a-zA-Z0-9]/g, '');
                var user = User.findOne({username: username});
                if (!user){
                    update.$set.username = username;
                }
            }
            if (params.profile.dateOfBirth && typeof(params.profile.dateOfBirth) !== 'object'){
                delete(params.profile.dateOfBirth);
            }

            // If explicitly specified
            if (params.profile.privateChannel === true || params.profile.privateChannel === false){
                Mix.update({userId: userId}, {$set: {isPublic: !params.profile.privateChannel}}, {multi: true});
            }

            User.update({_id: userId}, update);
            return true;
        }
    });
});
