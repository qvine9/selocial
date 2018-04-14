/**
 * My music controller
 */
angular.module('selocial').controller('PurchasesPageController', function(uploader, $state, $reactive, $scope, $rootScope, api, $timeout){
    $reactive(this).attach($scope);

    var page = this;

    this.subscribe('purchases');

    api('track.purchases', {}).then(tracks => $scope.tracks = tracks);

    page.helpers({
        tracks: function(){
            var tracks = $scope.getReactively('tracks');
            Purchase.find().forEach(p => {
                var track = _.find(tracks, t => t._id === p.trackId);
                if (!track){
                    track = p.track;
                    if (track){
                        tracks.push(p.track);
                    }
                }
                if (track){
                    track.purchaseId = p._id;
                }
            });
            return tracks;
        }
    });
});
