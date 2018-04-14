Picker.route('/apidocs', function(params, req, res, next) {
    res.setHeader('Content-type', 'text/html;charset=utf-8');

    res.write('<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Selocial API Docs</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootswatch/3.3.7/cosmo/bootstrap.min.css"></head><body><div class="container">');

    res.write('<h1>Selocial API Docs</h1>');
    res.write('<p>API endpoints can be invoked using HTTP POST requests, where the posted data should be a JSON encoded payload, and the request is a JSON string.</p>');
    res.write('<p>The api endpoint URL is /api/:endpointModule/:endpointMethod.</p>');
    res.write('<p>API endpoints use the accessToken parameter for authentication.</p>');
    res.write('<p>Example CURL request:</p>');
    res.write('<pre>curl -H "Content-Type: application/json" -X POST -d \'{"channelName":"Stock"}\' https://selocial.com/api/channel/getDetails</pre>');

    res.write('<h2>Get access token</h2>');
    res.write('<pre>curl -H "Content-Type: application/json" -X POST -d \'{"username":"alan","password":"12345"}\' https://selocial.com/api/profile/login</pre>');
    res.write('<p>The response is the access token string, or an error object.</p>');

    res.write('<hr />');

    res.write('<h2>Admin modules</h2>');
    _.each(Api.modules, function(moduleConfig, moduleName){
        res.write('<h3>' + moduleName + '</h3>');


        _.each(moduleConfig.endpoints, function(endpoint, endpointName){
            res.write('<div style="padding-left:40px">');
            res.write('<h4>' + endpointName + '</h4>');
            res.write('<p>' + endpoint.description + '</p>');
            if (endpoint.accessTokenRequired){
                res.write('<p><b>Access token is required!</b></p>');
            }

            if (endpoint.params){
                res.write('<h5>Params</h5>');
                res.write('<div style="padding-left:40px"><dl>');

                _.each(endpoint.params, function(paramDefinition, paramName){
                    res.write('<dt>' + paramName + '</dt>');
                    res.write('<dd>' + paramDefinition.description + '</dd>');
                });

                res.write('</div>');
            }

            res.write('<p>Sample request:</p>');
            res.write('<pre>' + JSON.stringify(endpoint.sample.request || 'TODO: write sample', null, 2) + '</pre>');

            res.write('<p>Sample response:</p>');
            res.write('<pre>' + JSON.stringify(endpoint.sample.response || 'TODO: write sample', null, 2) + '</pre>');

            res.write('</div><hr />');
        });

    });



    res.end('</div></body></html>');
});
