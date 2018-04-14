var stripe = Npm.require("stripe")(config.stripePrivateKey);

Meteor.startup(function(){
    /**
     * Payment transaction
     */
    Api.registerEndpoint('payment', 'transaction', {
        description: "Payment transaction",
        accessTokenRequired: true,
        params: {
            paymentDetails: {
                description: "Payment details",
            },
            paymentType: {
                description: "Payment type",
                type: String
            },
            transactionDetails: {
                description: "Transaction details",
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

            var doTransaction = function(creditAmount) {

                // Add credits to userId
                TransactionService.giveCredits(userId, creditAmount, { payment: params.transactionDetails, action: params.paymentType, details: params.paymentDetails });

                var commissions = [];

                // Process action
                switch (params.paymentType){

                    // Send tip to a mix
                    case 'tip':
                        var mix = Mix.findOne({_id: params.paymentDetails.mixId});
                        if (!mix) {
                            throw new Meteor.Error("Mix not found!");
                        }

                        // Add affiliate commission
                        if (params.affiliate) {
                            commissions.push({
                                userId: params.affiliate,
                                percent: config.commissions.tip.mix.affiliate,
                                reason: 'affiliate'
                            });
                        }

                        // If mix creator is eligible for commission...
                        if (config.mixCreatorGetsCommissionIfAuthor ||              // mix creator commission enabled
                            !mix.tracks ||                                          // no 3rd-party tracks
                            (mix.tracks[0] && mix.tracks[0].userId !== mix.userId)  // track owner is not the same as mix creator
                        ){
                            // ... add mix creator commission
                            commissions.push({
                                userId: mix.userId,
                                percent: config.commissions.tip.mix.mixCreator,
                                reason: 'mixCreator'
                            });
                        }

                        var log = {
                            mixId: mix._id,
                            payerId: userId,
                            date: new Date()
                        };

                        TransactionService.tip(userId, params.paymentDetails.mixId, creditAmount, commissions, log);
                        break;

                    // Send tip to a track
                    case 'tipTrack':
                        var track = Track.findOne({_id: params.paymentDetails.trackId});
                        if (!track) {
                            throw new Meteor.Error("Track not found!");
                        }

                        // Add affiliate commission
                        if (params.affiliate) {
                            commissions.push({
                                userId: params.affiliate,
                                percent: config.commissions.tip.track.affiliate,
                                reason: 'affiliate'
                            });
                        }

                        // If tipping occured on a mix card...
                        if (params.paymentDetails.mixId){
                            var mix = Mix.findOne({_id: params.paymentDetails.mixId});
                            if (!mix) {
                                throw new Meteor.Error("Mix not found!");
                            }

                            // If mix creator is eligible for commission...
                            if (config.mixCreatorGetsCommissionIfAuthor ||  // mix creator commission enabled
                                track.userId !== mix.userId                 // track owner is not the same as mix creator
                            ){
                                // ... add mix creator commission
                                commissions.push({
                                    userId: mix.userId,
                                    percent: config.commissions.tip.track.mixCreator,
                                    reason: 'mixCreator'
                                });
                            }
                        }

                        var log = {
                            mixId: params.paymentDetails.mixId || null,
                            trackId: params.paymentDetails.trackId,
                            payerId: userId,
                            date: new Date()
                        };

                        TransactionService.tipTrack(userId, params.paymentDetails.trackId, creditAmount, commissions, log);
                        break;

                    case 'buy':
                        var track = Track.findOne({_id: params.paymentDetails.trackId});
                        if (!track) {
                            throw new Meteor.Error("Track not found!");
                        }

                        // Add affiliate commission
                        if (params.affiliate) {
                            commissions.push({
                                userId: params.affiliate,
                                percent: config.commissions.buy.track.affiliate,
                                reason: 'affiliate'
                            });
                        }

                        // If buying occured on a mix card...
                        if (params.paymentDetails.mixId){
                            var mix = Mix.findOne({_id: params.paymentDetails.mixId});
                            if (!mix) {
                                throw new Meteor.Error("Mix not found!");
                            }

                            // If mix creator is eligible for commission...
                            if (config.mixCreatorGetsCommissionIfAuthor ||  // mix creator commission enabled
                                track.userId !== mix.userId                 // track owner is not the same as mix creator
                            ){
                                // ... add mix creator commission
                                commissions.push({
                                    userId: mix.userId,
                                    percent: config.commissions.buy.track.mixCreator,
                                    reason: 'mixCreator'
                                });
                            }
                        }

                        var log = {
                            mixId: params.paymentDetails.mixId || null,
                            trackId: params.paymentDetails.trackId,
                            payerId: userId,
                            date: new Date()
                        };

                        TransactionService.buyTrack(userId, params.paymentDetails.trackId, creditAmount, commissions, log);
                        break;

                }
            };

            var creditAmount = params.paymentDetails.amount;

            // TODO: call doTransaction(creditAmount) directly if the user's credit balance is larger than the amount (if internal currency is enabled)

            // Stripe payment
            stripe.charges.create({
                amount: params.paymentDetails.amount * config.creditInUsd * 100,
                currency: "usd",
                source: params.transactionDetails.id,
                description: "Selocial payment"
            }, {api_key: config.stripePrivateKey}, Meteor.bindEnvironment(function(err, charge) {
                if (!err){
                    // Handle transaction
                    doTransaction(creditAmount);
                }
            }));

        }
    });
});
