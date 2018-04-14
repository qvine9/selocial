var request = Npm.require('request');
/**
 * Download a track
 */

 Picker.route('/download/:purchaseId', function(params, req, res, next) {
     try {
         var purchase = Purchase.findOne({_id: params.purchaseId});
         var track = Track.findOne({_id: purchase.trackId});
         if (!track){
             track = purchase.track;
         }

         res.setHeader('Content-Type', 'audio/mpeg');
         res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(track.artist + ' - ' + track.title + '.mp3') + '"');


         request(track.file.url).pipe(res);
         //res.end(JSON.stringify(track));
     } catch(err){
         res.end("Error");
     }
 });
