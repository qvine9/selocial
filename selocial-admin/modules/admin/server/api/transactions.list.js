Meteor.methods({
    transactions_list: function(){
        var transactions = Transaction.find({credits:{$exists:1}},{sort:{date:-1}}).fetch();
        transactions.forEach(function(transaction){
            var s = Meteor.users.findOne({_id: transaction.sourceUserId},{username: 1});
            if (s){
                transaction.sourceUserId = s.username;
            }
            
            var s = Meteor.users.findOne({_id: transaction.targetUserId},{username: 1});
            if (s){
                transaction.targetUserId = s.username;
            }
        });
        return transactions;
    }
})