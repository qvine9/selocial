/**
 * Api handler
 */
Picker.route('/api/:module/:method', function(params, req, res, next) {
    res.setHeader('Content-type', 'application/json;charset=utf-8');

    Meteor.call(params.module + '_' + params.method, req.body, function(err, response){
        if (err){
            res.end(JSON.stringify({ error: err }));
        } else {
            res.end(JSON.stringify(response));
        }
    });
});
