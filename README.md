# Selocial

Contents of this branch:

## selocial

This is the path to the Meteor application. Set up a local development environment with:

```
curl https://install.meteor.com/ | sh
```

Then chdir into `selocial/` and run it with:

```
meteor
```

## selocial-assets

These assets are stored in S3, and should be publicly available. The reason to have them here is to reduce the amount of time required to deploy the application.

## selocial-deploy

Deployment config. The app uses a custom mupx fork for deployments.

First let's install mupx dependencies o. Navigate to `selocial-deployment/meteor-up` and run:

```
npm install
```

Creating a deploy target:

```
cd selocial-deploy
mkdir your-deployment-name
cd your-deployment-name
../meteor-up/bin/mup init
```

Edit `mup.json`, set up server connection params, app path and environment variables.
Set the `NODE_ENV` environtment variable to `production` for production deployments.

Set up the server environment by running:

```
../meteor-up/bin/mup setup
```

Everything is ready to deploy the app. From now on, all you have to do is chdir to this directory and enter:

```
../meteor-up/bin/mup deploy
```

The app will run in a Docker container. To edit dependencies, add 3rd pary applications etc, edit `selocial-deploy/meteor-up/templates/linux/start.sh`.

---

# Development cheatsheet

## selocial/server

```js
// Optimize the size of an image file
MediaConverter.convertImage('/tmp/vid.png', '/tmp/vid2.jpg', function(err, resizedImageFile){ });

// Transcode a video to standard web format
MediaConverter.transcodeVideo("/tmp/vid.mp4", "/tmp/vid2.mp4", function(err, transcodedVideoFile){ });

// Capture a frame of the video
MediaConverter.captureFrame("/tmp/vid.mp4", '/tmp/vid.png', function(err, capturedImageFile){ });

// Transcode an audio file
MediaConverter.transcodeAudio("/tmp/sound1.wav", "/tmp/sound1.mp3", function(err, transcodedAudioFile){ });

// Render a waveform for an audio file
MediaConverter.renderWaveform("/tmp/sound1.wav", "/tmp/sound1.png", function(err, waveformFile){ });

// Upload a file
FileStorage.save("/tmp/sound1.png", "remote-waveform-test.png", function(err, url){  });
```

# Payment flow

There are 3 types of payments the system can handle, sending tip for a mix, sending tips for a track, and purchasing a track.

Every payment is initiated by calling the "payment.transaction" API endpoint with a section like this:

```js
// Initialize Stripe
var handler = StripeCheckout.configure({
    key: config.stripePublicKey,
    image: 'https://dwzrkd09yh5h8.cloudfront.net/images/selocial-logo-circle.png',
    locale: 'auto',
    currency: 'usd',
    bitcoin: true,
    token: function(transactionDetails) {

        // Call Selocial API endpoint
        api("payment.transaction", {
            transactionDetails: transactionDetails,
            // additional payment options
        }).then(function(){
            // callback after successful payment
        }).catch(function(){
            // error callback
        });

    }
});

// Open the Stripe payment dialog
handler.open({
    amount: Math.floor(amountInUSD * 100), // Amount in cents
    name: 'Selocial', // Dialog title
    description: 'Tip', // Dialog description
});
```

You can find samples of actual implementation in `selocial/modules/selocial/client/dialogs/tip/tip.js` and `selocial/modules/selocial/client/dialogs/purchase/purchase.js`.

The API endpoint processing payments can be found in `selocial/modules/selocial/server/api/payment/transaction.js`. The `doTransaction` function is called internall after the actual Stripe payment has been made at the end of the API method's body. This function decides what extra commissions are given besides the ones defined on the settings page of each track based on the params sent to the API endpoint. The transactions are then passed to one of `TransactionService.buyTrack`, `TransactionService.tipTrack` or `TransactionService.tip`.
All of these methods work the same way with slight differences. You can find the `TransactionService` class implementation in `selocial/modules/selocial/server/lib/services/TransactionService.js`.

Payment related configuration options can be found in selocial/modules/selocial/server/config/payments.js`.

## Sending tip for a track

There is no frontend UI control yet to trigger tipping a track directly. Doing so requires the above call on the client side with the following API parameters:

```js
api("payment.transaction", {
    transactionDetails: transactionDetails,
    paymentType: 'tipTrack',
    paymentDetails: {
        mixId: mix_id_containing_the_track, // optional, only if someone tipped the track on a mix card
        trackId: track_id,
        amount: tip_amount_in_usd
    }
}).then(function(){/*...*/}).catch(function(){/*...*/});
```

The `TransactionService.tipTrack` method has the following structure:

Step 1: Find the track, and the track owner.


```js
var track = Track.findOne({_id: trackId});
var trackOwner = User.findOne({_id: track.userId});
if (!trackOwner){
    throw new Meteor.Error("Track owner not found!");
}
```

Step 2: Get the user's location based on it's last known IP address and calculate tax percentage.

```js
var geo = TransactionService.getUserRegion(buyerId);
var taxPercent = (geo && config.taxSettings[geo.country] && config.taxSettings[geo.country][geo.region] && config.taxSettings[geo.country][geo.region].tip) || 0;
```

Step 3: Insert tax amount to the `TrackPaymentLog` collection.

```js
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
```

Step 4: Process selocial and extra (mix creator, affiliate) commissions.

```js
// Get Selocial commission
var selocialCommissionPercent = config.selocialCommissionPercentage,
    selocialCommission = amount * selocialCommissionPercent / 100;

if (commissions && commissions.length){
    // Process extra commissions
    _.each(commissions, function(commission){
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
amount -= amount * config.selocialCommissionPercentage / 100;
```

Step 5: Process contributor and publisher commissions.

```js
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
```

Step 6: Transfer credits to track owner

```js
TransactionService.transferCredits(buyerId, track.userId, amount, { action: 'tip.track', track: trackId });
```

## Sending tip for a mix

Tipping a mix has a very similar flow of tipping a track. The client side API call looks like this:

```js
api("payment.transaction", {
    transactionDetails: transactionDetails,
    paymentType: 'tip',
    paymentDetails: {
        mixId: mix_id,
        amount: tip_amount_in_usd
    }
}).then(function(){/*...*/}).catch(function(){/*...*/});
```

The server side `TransactionService.tip` class is structured the same way the `tipTrack` is, but instead of tipping a single track, it iterates over all the tracks of the mix and splits the tip among them.

```js

// Iterate over Selocial tracks in the mix
var selocialTracks = _.filter(mix.tracks, track => track.source !== 'soundcloud');
if (selocialTracks.length){
    var trackAmount = amount / selocialTracks.length;
    _.each(selocialTracks, function(trackData){
        var track = Track.findOne({_id: trackData._id});
        if (track){

            // Tip individual tracks

        }
    });
} else {
    // If there are no tracks in the mix, and the mixCreatorGetsTheRest option is set, the tipped amount will be credited to the mix owner.
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
```

## Purchasing a track

The `TransactionService.buyTrack` method works like tipping a singe track, but also considers mechanicals and inserts a record into the `Purchase` collection so that it's easier to keep track of a user's own purchased tracks.

Processing mechanicals before calculating extra commissions:

```js
var mechanicalsIncludedInPrice = geo && geo.country === 'US';
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
}
```

Inserting an entry into the `Purchase` collection:

```js
Purchase.insert({
    trackId: trackId,
    userId: buyerId,
    amount: totalAmount,
    date: new Date(),
    track: Track.findOne({_id: trackId})
});
```

## Showing commissions ans stats

The `selocial/modules/selocial/client/pages/payments/payments.js` file contains the controller for collecting all the payment logs related to a single user. It reads `TrackPaymentLog` entries returned by the server's `commissions` publication defined in `selocial/modules/selocial/server/api/track/_publish.js`, and combines results by contributors and publishers:

```js
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
```

This then gets populated to the table defined in `payments.html`. The `Paid` button next to each entry calls the `payment.pay` API method, which sets the status of the appropriate `TrackPaymentLog` entires to true.

## Withdrawing to bank account

Withdrawing money to a user's own bank account can also be triggered from the `payments.html` page, it calls the `payment.withdraw` method once a Stripe token has successfully been requested.

```
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
```
