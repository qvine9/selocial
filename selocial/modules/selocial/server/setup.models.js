/**
 * Set up database models
 */

_.each(config.collections, function(collection, collectionName){

    // Deny insert/update/remove by the client (collections may only be changed by methods)
    if (!collection.overridePermissions){
        collection.deny({
            insert: function(userId, doc){
                return true;
            },
            update: function(userId, docs, fields, modifier){
                return true;
            },
            remove: function(userId, doc){
                return true;
            }
        });
    }

})
