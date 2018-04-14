let child_process = Npm.require('child_process');

/**
 * Shell command service
 */
class _ShellCommand {  
    
    /**
     * Run an external application
     */
    static run(executable, args, callback, collectError){
        var error = "",
            output = "";
        
        var command = child_process.spawn(executable, args);
        
        command.stdout.on('data', function (data) {
            output += data;
        });
        
        command.stderr.on('data', function (data) {
            error += data;
        });

        command.on('exit', Meteor.bindEnvironment(function (code) {
            callback(code || collectError ? error : null, output);
        }));
    }
    
}

// Export class
ShellCommand = _ShellCommand;