/**
 * Purchase track dialog controller
 */
angular.module('selocial').controller('purchaseDialogController', function($scope, params, api, $state, error){
    var dlg = this;

    api('track.purchases', {}).then(tracks => {
        dlg.purchasedTracks = tracks;
        dlg.isPurchased = !!_.find(dlg.purchasedTracks, track => track._id === params.trackId);
    });


    var handler = StripeCheckout.configure({
        key: config.stripePublicKey,
        image: 'https://dwzrkd09yh5h8.cloudfront.net/images/selocial-logo-circle.png',
        locale: 'auto',
        currency: 'usd',
        bitcoin: true,
        token: function(transactionDetails) {
            api("payment.transaction", {
                transactionDetails: transactionDetails,
                paymentType: 'buy',
                paymentDetails: {
                    trackId: params.trackId,
                    amount: dlg.amount
                }
            }).then(function(){
                $scope.$close();
                $state.go('purchases');
            }).catch(error);
        }
    });

    this.amount = 0.0;
    api('track.get', {trackId: params.trackId}).then(function(track){
        dlg.track = track;
        dlg.amount = dlg.track.price;
    }).catch(error);


    /**
     * Send the tip
     */
    
    
    
    this.buy = ()=>{
        if (typeof(dlg.amount) === 'undefined' || dlg.amount < dlg.track.price){
            return error("This track costs at least " + dlg.track.price + " USD!");
        }
        if (dlg.amount == 0){
            api("payment.transaction", {
                transactionDetails: transactionDetails,
                paymentType: 'buy',
                paymentDetails: {
                    trackId: params.trackId,
                    amount: dlg.amount
                }
            }).then(function(){
                $scope.$close();
                $state.go('purchases');
            }).catch(error);
        } else {
            handler.open({
                amount: Math.floor(this.amount * 100),
                name: 'Selocial',
                description: 'Purchase track',
            });
        }
    };

    this.gotoPurchase = function(){
        $scope.$close();
        $state.go('purchases');
    };
});
