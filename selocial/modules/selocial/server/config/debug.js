/**
 * Debug config
 */
config.debug = {
    /**
     * Should we run in debug mode?
     * 
     * @type boolean
     */
    isDebug: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
};