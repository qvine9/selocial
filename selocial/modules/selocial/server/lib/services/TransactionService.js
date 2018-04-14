class _TransactionService {

    /**
     * Check if the user has the required balance available, throw exception
     */
    static checkBalance(userId, credits){
        var user = User.findOne({_id: userId}, {fields: {creditBalance: 1}});
        if (!user.creditBalance || user.creditBalance < credits) {
            throw new Meteor.Error("You don't have enough credits!");
        }
    }

    /**
     * Add time to a user's timebank
     */
    static giveTime(userId, timeInSeconds, params){
        Transaction.insert({
            date: new Date(),
            sourceUserId: config.transaction.systemUserId,
            targetUserId: userId,
            time: timeInSeconds,
            params: params || {}
        });
        User.update({_id: userId}, {$inc: {timebankBalance: timeInSeconds}});
    }

    /**
     * Add credits to a user's balance
     */
    static giveCredits(userId, credits, params){
        Transaction.insert({
            date: new Date(),
            sourceUserId: config.transaction.systemUserId,
            targetUserId: userId,
            credits: credits,
            params: params || {}
        });
        User.update({_id: userId}, {$inc: {creditBalance: credits}});
    }

    /**
     * Spend credits
     */
    static spendCredits(userId, credits, params){
        this.checkBalance(userId, credits);
        Transaction.insert({
            date: new Date(),
            sourceUserId: userId,
            targetUserId: config.transaction.systemUserId,
            credits: credits,
            params: params || {}
        });
        User.update({_id: userId}, {$inc: {creditBalance: -credits}});
    }

    /**
     * Transfer credits from user A to user B
     */
    static transferCredits(fromUserId, toUserId, credits, params){
        this.checkBalance(fromUserId, credits);
        Transaction.insert({
            date: new Date(),
            sourceUserId: fromUserId,
            targetUserId: toUserId,
            credits: credits,
            params: params || {}
        });
        User.update({_id: fromUserId}, {$inc: {creditBalance: -credits}});
        if (User.findOne({_id: toUserId})){
            User.update({_id: toUserId}, {$inc: {creditBalance: credits}});
        } else if (User.findOne({username: toUserId})){
            User.update({username: toUserId}, {$inc: {creditBalance: credits}});
        }
    }

    /**
     * Withdraw money from the user's credit balance to the user's bank account
     */
    static withdraw(userId, amount, transferDetails){
        var creditAmount = amount / config.creditInUsd;
        TransactionService.transferCredits(userId, 'withdraw credits', creditAmount, _.extend(transferDetails || {}, { action: 'withdraw' }));
    }

    /**
     * Get the region of a user
     */
    static getUserRegion(userId){
        var user = User.findOne({_id: userId}, {fields: {'status.lastLogin.ipAddr': 1}});
        var geoip = GeoIP.lookup(user.status.lastLogin.ipAddr);
        return geoip;
    }

    /**
     * Get the tax amount from the total amount and the tax percent
     */
    static getTax(amount, taxPercent){
        var totalPercent = 100 + taxPercent;
        return amount * taxPercent / totalPercent
    }

    /**
     * Buy a track
     *
     * @param {string} buyerId      The ID of the user who's buying the track
     * @param {string} trackId      The ID of the track being bought
     * @param {string} amount       The amount being payed IN CREDITS!!! (at least the track's price)
     * @param {array} commissions   An array of objects with [userId,percentage,reason] keys holding extra commissions (mix owner, affiliate partner, etc)
     * @param {object} log          TrackPaymentLog base object
     */
    static buyTrack(buyerId, trackId, amount, commissions, log){
        var track = Track.findOne({_id: trackId});

        // Make sure track is purchasable, and the user is paying at least the amount of what it costs
        if (!track.purchasable){
            throw new Meteor.Error("This track is not purchasable!");
        } else if (track.price && track.price > amount){
            throw new Meteor.Error("This track costs at least "+track.price+" credits!");
        }

        var trackOwner = User.findOne({_id: track.userId});
        if (!trackOwner){
            throw new Meteor.Error("Track owner not found!");
        }

        var totalAmount = amount;

        // Get the user's region
        var geo = TransactionService.getUserRegion(buyerId);
        var taxPercent = (geo && config.taxSettings[geo.country] && config.taxSettings[geo.country][geo.region] && config.taxSettings[geo.country][geo.region].download) || 0;
        var mechanicalsIncludedInPrice = geo && geo.country === 'US';

        // Get tax
        if (taxPercent){
            var tax = TransactionService.getTax(amount, taxPercent);
            TrackPaymentLog.insert(_.extend({
                recipient: "GOVERNMENT",
                reason: "buy.track.tax",
                percentage: taxPercent,
                amount: tax
            }, log));
            amount -= tax;
            TransactionService.transferCredits(buyerId, "GOVERNMENT", tax, { action: 'buy.track.tax', track: trackId });
        }

        // Get Selocial commission & stripe fee 0.30 USD
        var selocialCommissionPercent = config.selocialCommissionPercentage,
            selocialCommission = amount * selocialCommissionPercent / 100 + 0.30;

        // Mechanicals
        if (!mechanicalsIncludedInPrice) {
            if (track.mechanicals && track.mechanicals.length){
                _.each(track.mechanicals, function(mechanical){
                    if (mechanical.percent){
                        TrackPaymentLog.insert(_.extend({
                            recipient: mechanical.name,
                            reason: "buy.track.mechanical",
                            percentage: mechanical.percent,
                            amount: config.mechanicalsAmount * mechanical.percent / 100
                        }, log));
                    }
                });
            } else {
                var mechanicalPercent = config.mechanicalsAmount * 100 / amount;
                TrackPaymentLog.insert(_.extend({
                    recipient: trackOwner.username,
                    reason: "buy.track.mechanical",
                    percentage: mechanicalPercent,
                    amount: config.mechanicalsAmount
                }, log));
            }
            //selocialCommission -= config.mechanicalsAmount;
            //amount -= config.mechanicalsAmount;
            //TransactionService.transferCredits(buyerId, "MECHANICAL", config.mechanicalsAmount, { action: 'buy.track.mechanical', track: trackId });
        }

        if (commissions && commissions.length){
            // Process extra commissions
            _.each(commissions, function(commission){
                // userId, percent, reason
                var commissionAmount = amount * commission.percent / 100;
                selocialCommission -= commissionAmount;
                selocialCommissionPercent -= commission.percent;
                var commissionUser = User.findOne({_id: commission.userId});
                TransactionService.transferCredits(buyerId, commission.userId, commissionAmount, { action: 'buy.track.'+commission.reason, track: trackId });
                TrackPaymentLog.insert(_.extend({
                    recipient: commissionUser.username,
                    reason: "buy.track."+commission.reason,
                    percentage: commission.percent,
                    amount: commissionAmount
                }, log));
            });
        }

        // Selocial commission
        TransactionService.transferCredits(buyerId, config.transaction.systemUserId, selocialCommission, { action: 'buy.track.adminFee', track: trackId });
        TrackPaymentLog.insert(_.extend({
            recipient: 'Selocial',
            reason: 'buy.track.adminFee',
            percentage: selocialCommissionPercent,
            amount: selocialCommission
        }, log));
        amount -= amount * config.selocialCommissionPercentage / 100 + 0.30;

        // Contributors and publishers
        var amountToSplit;
        if (track.publishers && track.publishers.length && track.contributors && track.contributors.length){
            amountToSplit = amount / 2;
        } else {
            amountToSplit = amount;
        }
        _.each(['publishers', 'contributors'], function(splitType){
            if (track[splitType] && track[splitType].length){
                _.each(track[splitType], function(x){
                    if (x.percent){
                        TrackPaymentLog.insert(_.extend({
                            recipient: x.name,
                            reason: "buy.track."+splitType.replace(/s$/,''),
                            percentage: x.percent,
                            amount: amountToSplit * x.percent / 100
                        }, log));
                    }
                });
            }
        });

        // Transfer credits to track owner
        TransactionService.transferCredits(buyerId, track.userId, amount, { action: 'buy.track', track: trackId });

        // Save purchase
        Purchase.insert({
            trackId: trackId,
            userId: buyerId,
            amount: totalAmount,
            date: new Date(),
            track: Track.findOne({_id: trackId})
        });
    }

    /**
     * Send a tip for a track
     *
     * @param {string} buyerId      The ID of the user who's paying
     * @param {string} trackId      The ID of the track to which the tip is paid
     * @param {string} amount       The amount in credits
     * @param {object} commissions  An array of objects with [userId,percentage,reason] keys holding extra commissions (mix owner, affiliate partner, etc)
     * @param {object} log          TrackPaymentLog base object
     */
    static tipTrack(buyerId, trackId, amount, commissions, log){
        var track = Track.findOne({_id: trackId});

        var trackOwner = User.findOne({_id: track.userId});
        if (!trackOwner){
            throw new Meteor.Error("Track owner not found!");
        }

        // Get the user's region
        var geo = TransactionService.getUserRegion(buyerId);
        var taxPercent = (geo && config.taxSettings[geo.country] && config.taxSettings[geo.country][geo.region] && config.taxSettings[geo.country][geo.region].tip) || 0;

        // Get tax
        if (taxPercent){
            var tax = TransactionService.getTax(amount, taxPercent);
            TrackPaymentLog.insert(_.extend({
                recipient: "GOVERNMENT",
                reason: "tip.track.tax",
                percentage: taxPercent,
                amount: tax
            }, log));
            amount -= tax;
        }

        // Get Selocial commission
        var selocialCommissionPercent = config.selocialCommissionPercentage,
            selocialCommission = amount * selocialCommissionPercent / 100 + 0.30;

        if (commissions && commissions.length){
            // Process extra commissions
            _.each(commissions, function(commission){
                // userId, percent, reason
                var commissionAmount = amount * commission.percent / 100;
                selocialCommission -= commissionAmount;
                selocialCommissionPercent -= commission.percent;
                var commissionUser = User.findOne({_id: commission.userId});
                TransactionService.transferCredits(buyerId, commission.userId, commissionAmount, { action: 'tip.track.'+commission.reason, track: trackId });
                TrackPaymentLog.insert(_.extend({
                    recipient: commissionUser.username,
                    reason: "tip.track."+commission.reason,
                    percentage: commission.percent,
                    amount: commissionAmount
                }, log));
            });
        }

        // Selocial commission
        TransactionService.transferCredits(buyerId, config.transaction.systemUserId, selocialCommission, { action: 'tip.track.adminFee', track: trackId });
        TrackPaymentLog.insert(_.extend({
            recipient: 'Selocial',
            reason: 'tip.track.adminFee',
            percentage: selocialCommissionPercent,
            amount: selocialCommission
        }, log));
        amount -= amount * config.selocialCommissionPercentage / 100 + 0.30;

        // Contributors and publishers
        var amountToSplit;
        if (track.publishers && track.publishers.length && track.contributors && track.contributors.length){
            amountToSplit = amount / 2;
        } else {
            amountToSplit = amount;
        }
        _.each(['publishers', 'contributors'], function(splitType){
            if (track[splitType] && track[splitType].length){
                _.each(track[splitType], function(x){
                    if (x.percent){
                        TrackPaymentLog.insert(_.extend({
                            recipient: x.name,
                            reason: "tip.track."+splitType.replace(/s$/,''),
                            percentage: x.percent,
                            amount: amountToSplit * x.percent / 100
                        }, log));
                    }
                });
            }
        });

        // Transfer credits to track owner
        TransactionService.transferCredits(buyerId, track.userId, amount, { action: 'tip.track', track: trackId });

    }

    /**
     * Send a tip for a mix
     *
     * @param {string} buyerId      The ID of the user who's paying
     * @param {string} mixId        The ID of the mix to which the tip is paid
     * @param {string} amount       The amount in credits
     * @param {object} commissions  An array of objects with [userId,percentage,reason] keys holding extra commissions (mix owner, affiliate partner, etc)
     * @param {object} log          TrackPaymentLog base object
     */
    static tip(buyerId, mixId, amount, commissions, log){
        var mix = Mix.findOne({_id: mixId});

        var mixOwner = User.findOne({_id: mix.userId});
        if (!mixOwner){
            throw new Meteor.Error("Mix owner not found!");
        }

        // Get the user's region
        var geo = TransactionService.getUserRegion(buyerId);
        var taxPercent = (geo && config.taxSettings[geo.country] && config.taxSettings[geo.country][geo.region] && config.taxSettings[geo.country][geo.region].tip) || 0;

        // Get tax
        if (taxPercent){
            var tax = TransactionService.getTax(amount, taxPercent);
            TrackPaymentLog.insert(_.extend({
                recipient: "GOVERNMENT",
                reason: "tip.mix.tax",
                percentage: taxPercent,
                amount: tax
            }, log));
            amount -= tax;
        }

        // Get Selocial commission
        var selocialCommissionPercent = config.selocialCommissionPercentage,
            selocialCommission = amount * selocialCommissionPercent / 100 + 0.30;

        if (commissions && commissions.length){
            // Process extra commissions
            _.each(commissions, function(commission){
                // userId, percent, reason
                var commissionAmount = amount * commission.percent / 100;
                selocialCommission -= commissionAmount;
                selocialCommissionPercent -= commission.percent;
                var commissionUser = User.findOne({_id: commission.userId});
                TransactionService.transferCredits(buyerId, commission.userId, commissionAmount, { action: 'tip.mix.'+commission.reason, mix: mixId });
                TrackPaymentLog.insert(_.extend({
                    recipient: commissionUser.username,
                    reason: "tip.mix."+commission.reason,
                    percentage: commission.percent,
                    amount: commissionAmount
                }, log));
            });
        }

        // Selocial commission
        TransactionService.transferCredits(buyerId, config.transaction.systemUserId, selocialCommission, { action: 'tip.mix.adminFee', mix: mixId });
        TrackPaymentLog.insert(_.extend({
            recipient: 'Selocial',
            reason: 'tip.mix.adminFee',
            percentage: selocialCommissionPercent,
            amount: selocialCommission
        }, log));
        amount -= amount * config.selocialCommissionPercentage / 100 + 0.30;

        // Iterate over Selocial tracks in the mix
        var selocialTracks = _.filter(mix.tracks, track => track.source !== 'soundcloud');
        if (selocialTracks.length){
            var trackAmount = amount / selocialTracks.length;
            _.each(selocialTracks, function(trackData){
                var track = Track.findOne({_id: trackData._id});
                if (track){

                    // Contributors and publishers
                    var amountToSplit;
                    if (track.publishers && track.publishers.length && track.contributors && track.contributors.length){
                        amountToSplit = trackAmount / 2;
                    } else {
                        amountToSplit = trackAmount;
                    }
                    _.each(['publishers', 'contributors'], function(splitType){
                        if (track[splitType] && track[splitType].length){
                            _.each(track[splitType], function(x){
                                if (x.percent){
                                    TrackPaymentLog.insert(_.extend(_.extend({
                                        recipient: x.name,
                                        reason: "tip.mix.track."+splitType.replace(/s$/,''),
                                        percentage: x.percent,
                                        amount: amountToSplit * x.percent / 100
                                    }, log), {trackId: track._id}));
                                }
                            });
                        }
                    });

                    // Transfer credits to track owner
                    TransactionService.transferCredits(buyerId, track.userId, trackAmount, { action: 'tip.mix.track', mix: mixId, track: track._id });

                }
            });
        } else {
            if (config.mixCreatorGetsTheRest){
                // Mix owner gets it all
                TrackPaymentLog.insert(_.extend({
                    recipient: mixOwner.username,
                    reason: "tip.mix",
                    percentage: 100,
                    amount: amount
                }, log));

                // Transfer credits to mix owner
                TransactionService.transferCredits(buyerId, mix.userId, amount, { action: 'tip.mix', mix: mixId });
            }
        }
    }

}

// export
TransactionService = _TransactionService;
