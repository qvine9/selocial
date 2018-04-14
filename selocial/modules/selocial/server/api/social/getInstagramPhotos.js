Meteor.startup(function(){
    /**
     * getInstagramPhotos
     */
    Api.registerEndpoint('social', 'getInstagramPhotos', {
        description: "Get Instagram Photos",
        accessTokenRequired: true,
        params: {
        },

        sample: {
            request: "TODO",
            response: "TODO"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){
            var user = User.findOne({_id: userId}, {fields: {"services.instagram": 1 }});
            
            if (user.services) {
                var response = EJSON.parse(HTTP.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + user.services.instagram.accessToken + '&count=100').content);
                if (response.data){
                    return _.map(response.data, function(item){
                        return {
                            url: item.images.standard_resolution.url
                        };
                    });
                }
            }
            
            //console.log(user);
            
            return [];
        }
    });
});