angular.module('selocial')

/**
 * Social text filter
 */
.filter('socialText', function(){
    return function(str){
        var match;
        
        var linkRegex = /(https?:\/\/.*?)(\s|$)/;
        if (match = linkRegex.exec(str)) {
            str = str.replace(match[0], '<a href="'+match[1]+'" target="_blank">'+match[1]+'</a>' + match[2]);
        }
        
        var mentionRegex = /@(\w+)/;
        while (match = mentionRegex.exec(str)) {
            str = str.replace(match[0], '<a href="/'+escape(match[1])+'" class="mention-link">'+match[1]+'</a>');
        }
        
        var hashtagRegex = /#(\w+)/;
        while (match = hashtagRegex.exec(str)) {
            str = str.replace(match[0], '<a href="/tag/'+escape(match[1])+'" class="hashtag-link">'+match[1]+'</a>');
        }
        
        return str;
    };
});