Package.describe({
    summary: "Use Bower packages in your Meteor 1.3 app",
    name: "mindcrumbsbower",
    version: "1.0.1_1"
});

Package.on_use(function(api){
    api.use('isobuild:compiler-plugin@1.0.0');
});

Package.registerBuildPlugin({
    name: "bower",
    use: [
        "meteor",
        "underscore"
    ],
    sources: [
        "plugin/bower.js",
        "plugin/handler.js"
    ],
    npmDependencies: {
        "bower": "1.5.2",
        "glob": "5.0.14"
    }
});
