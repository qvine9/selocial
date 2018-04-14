/**
 * Track Info dialog controller
 */
angular.module('selocial').controller('tipDialogController', function($scope, params, api, $scope, error){
    var dlg = this;
    
    this.amount = 2.0;
    this.mix = params.mix;
    
    var handler = StripeCheckout.configure({
        key: config.stripePublicKey,
        image: 'https://dwzrkd09yh5h8.cloudfront.net/images/selocial-logo-circle.png',
        locale: 'auto',
        currency: 'usd',
        bitcoin: true,
        token: function(transactionDetails) {
            api("payment.transaction", {
                transactionDetails: transactionDetails,
                paymentType: 'tip',
                paymentDetails: {
                    mixId: params.mix._id,
                    amount: dlg.amount
                }
            }).then(function(){
                $scope.$close();
            }).catch(error);
        }
    });
    
    /**
     * Send the tip
     */
    this.sendTip = ()=>{
        handler.open({
            amount: Math.floor(this.amount * 100),
            name: 'Selocial',
            description: 'Tip',
        });
    };
    
});
