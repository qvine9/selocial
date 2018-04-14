// Hashtag regular expression
var hashtagRegex = /#(\w+)/;

// Mention regular expression
var mentionRegex = /@(\w+)/;

/**
 * Tagger service
 */
class _Tagger {
    /**
     * Get tags based on a pattern
     * 
     * @param {RegExp} pattern
     * @param {string} text
     * @returns {array}
     */
    static getTagsFromText(pattern, text){
        var ret = [],
            match;
        while (match = pattern.exec(text)) {
            text = text.replace(match[0], ' ');
            ret.push(match[1]);
        }
        return ret;
    };

    /**
     * Get the hashtags from the arguments
     * 
     * @returns {array}
     */
    static getHashtags(){
        var ret = [];
        for (var i = 0; i < arguments.length; i++) {
            ret = ret.concat(this.getTagsFromText(hashtagRegex, arguments[i]));
        }
        return _.uniq(ret);
    };

    /**
     * Get the mentions from the arguments
     * 
     * @returns {array}
     */
    static getMentions(){
        var ret = [];
        for (var i = 0; i < arguments.length; i++) {
            ret = ret.concat(this.getTagsFromText(mentionRegex, arguments[i]));
        }
        return _.uniq(ret);
    };
}

// Export
Tagger = _Tagger;