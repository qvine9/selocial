/**
 * My payments controller
 */
angular.module('selocial').controller('PaymentsPageController', function(notify, uploader, $state, $reactive, $scope, $rootScope, api, error, $timeout){
    $reactive(this).attach($scope);

    var page = this;

    page.bankAccountData = {
        country: 'US',
        currency: 'USD',
        routing_number: '',
        account_number: '',
        account_holder_name: ($scope.$root.currentUser.profile ? $scope.$root.currentUser.profile.name : null) || $scope.$root.currentUser.username,
        account_holder_type: 'individual'
    };

    page.recipientEmail = $scope.$root.currentUser.emails && $scope.$root.currentUser.emails[0].address;

    // Subscribe to video file
    this.subscribe('my-tracks');
    this.subscribe('commissions');

    page.helpers({
        myTracks: function(){
            return Track.find({userId: Meteor.userId() }, {sort: {title: -1}});
        },
        commissions: function(){
            var commissions = {};
            commissions.total = { tip: 0, purchase: 0, unpaid: 0, mechanical: 0 };
            TrackPaymentLog.find().forEach(log => {
                var key = log.trackId + log.recipient;
                commissions[key] || (commissions[key] = { tip: 0, purchase: 0, unpaid: 0, mechanical: 0 });
                switch (log.reason){
                    case 'buy.track.contributor':
                    case 'buy.track.publisher':
                        commissions[key].purchase += log.amount;
                        commissions.total.purchase += log.amount;
                        break;
                    case 'buy.track.mechanical':
                        commissions[key].mechanical += log.amount;
                        commissions.total.mechanical += log.amount;
                        break;
                    case 'tip.track.contributor':
                    case 'tip.track.publisher':
                    case 'tip.mix.contributor':
                    case 'tip.mix.publisher':
                    case 'tip.mix.track.contributor':
                    case 'tip.mix.track.publisher':
                        commissions[key].tip += log.amount;
                        commissions.total.tip += log.amount;
                        break;
                    default:
                        return;
                }
                if (!log.payed && log.reason !== 'buy.track.mechanical'){
                    commissions[key].unpaid += log.amount;
                    commissions.total.unpaid += log.amount;
                }
            });
            return commissions;
        }
    });

    page.withdraw = function(){
        Stripe.setPublishableKey(config.stripePublicKey);
        Stripe.bankAccount.createToken(page.bankAccountData, function(status, response){
            if (response.error) {
                error(response.error.message);
            } else {
                api('payment.withdraw', {
                    recipient: {
                        name: page.bankAccountData.account_holder_name,
                        type: page.bankAccountData.account_holder_type,
                        bank_account: response.id,
                        email: page.recipientEmail,
                        taxId: page.taxId
                    }
                }).then(function(){
                    notify.success("You have successfully sent your withdraw request!");
                }).catch(error);
            }
        });
    };

    /**
     * Mark as paid
     */
    page.pay = function(trackId, name){
        api('payment.pay', {trackId: trackId, name: name});
    };
});
