/**
 * Channel active page controller
 */
angular.module('selocial').controller('ChannelPageController', function(api, $stateParams, $reactive, $scope, mixStream){
    $reactive(this).attach($scope);
    
    this.channelName = $stateParams.name;
    api("channel.getDetails", {channelName: this.channelName}).then((channelDetails)=>{
        this.channelName = channelDetails.name;
        this.channelDetails = channelDetails;
    });
    this.channelStream = new mixStream(this, 'channel-mixes', {username: $stateParams.name});
    
});