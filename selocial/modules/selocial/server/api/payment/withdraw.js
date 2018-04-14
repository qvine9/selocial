var stripe = Npm.require("stripe")(config.stripePrivateKey);

Meteor.startup(function(){
    /**
     * Payment transaction
     */
    Api.registerEndpoint('payment', 'withdraw', {
        description: "Withdraw amount",
        accessTokenRequired: true,
        params: {
            recipient: {
                description: "Recipient details",
            }
        },
        sample: {
            request: "TODO: write",
            response: "TODO: write"
        },

        /**
         * Api endpoint implementation
         *
         * @param {object} params
         * @param {string} userId
         * @return {boolean}
         */
        callback: function(params, userId){

            var user = User.findOne({_id: userId});
            if (user.creditBalance > 5){
                stripe.recipients.create(params.recipient, function(err, recipient){

                    if (!err){

                        var amountInUsd = Math.floor(user.creditBalance * config.creditInUsd * 100);

                        stripe.transfers.create({
                            amount: amountInUsd,
                            currency: "usd",
                            recipient: recipient.id,
                            bank_account: params.recipient.bank_account,
                            statement_descriptor: "Selocial withdraw",
                        }, function(err, transfer){

                            if (!err){
                                TransactionService.withdraw(userId, user.creditBalance, {
                                    bankAccount: params.recipient,
                                    recipient: recipient,
                                    transfer: transfer
                                });
                            } else {
                                console.log(err);
                            }

                        });

                    } else {
                        console.log(err);
                    }
                });
            }

        }
    });
});
