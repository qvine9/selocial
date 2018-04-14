var jwt = Npm.require('jsonwebtoken');
var bcrypt = Npm.require('bcryptjs');
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare);

Meteor.startup(function(){
    /**
     * Enable band mode
     */
    Api.registerEndpoint('profile', 'login', {
        description: "Login with username and password.",
        params: {
            username: {
                description: "Username",
                schema: String
            },
            password: {
                description: "Password",
                schema: String
            }
        },

        sample: {
            request: {username: 'alan', password: '123456'},
            response: 'sdc728hicbd8732h8hrce34f3'
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {string}
         */
        callback: function(params, userId){
            var user = User.findOne({username: params.username});
            if (!user){
                throw new Meteor.Error("User not found!");
            }

            if (Accounts._checkPassword(user, {digest:params.password, algorithm: 'sha-256'})){
                return jwt.sign({userId: user._id}, config.security.encryptionKey, {
                    noTimestamp: true
                });
            } else {
                throw new Meteor.Error("invalidPassword", "The specified username or password is not valid.")
            }
        }
    });
});
