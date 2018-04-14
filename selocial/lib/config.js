/**
 * Global configuration
 */
config = {

    /**
     * Stripe payment gateway publishable key
     */
    stripePublicKey: 'pk_live_ExrN9mHvlr7A4x5VUmthJgCO',  // pk_test_xowXj9LWLFYquOhjY5VBYilB

    /**
     * Database collections
     */
    collections: {},

    /**
     * Validation schemas
     */
    schema: {

        /**
         * Access token schema
         */
        AccessToken: { type: String },

        /**
         * Username schema
         */
        Username: { type: String, min: 3, regEx: /^[a-zA-Z0-9]+$/ },

        /**
         * Password schema
         */
        Password: { type: String, min: 6 },

        /**
         * Email schema
         */
        Email: { type: String, regEx: SimpleSchema.RegEx.Email },

        /**
         * URL schema
         */
        Url: { type: String, regEx: SimpleSchema.RegEx.Url }
    },

    /**
     * Profile config
     */
    profile: {
        defaultImage: 'https://dwzrkd09yh5h8.cloudfront.net/images/DefaultProfilePic.png'
    },

    mostActiveCoverPhoto: 'https://dwzrkd09yh5h8.cloudfront.net/images/default-cover.jpg',
    searchCoverPhoto: 'https://dwzrkd09yh5h8.cloudfront.net/images/SearchCover.png',

    /**
     * Social platform config
     */
    social: {

        soundcloud: {
            clientId: 'ff98dd27336ccb54fb465cc2352eac53',
            callbackUrl: Meteor.absoluteUrl() + 'soundcloud-callback'
        }

    },

    dateFormat: 'dd/MM/yyyy',
    dateTimeFormat: 'dd/MM/yyyy HH:mm',

    googleAnalyticsTrackingCode: 'UA-38161760-1',

    /**
     * Contributor types
     *
     * We use objects instead of a simple string array because we may want to use additional form elements
     * depending on contributor type.
     */
    contributorTypes: {
        writer: { name: 'Writer' },
        performer: { name: 'Performer' },
        mixing: { name: 'Mixing' },
        mastering: { name: 'Mastering' },
        production: { name: 'Production' },
        backgroundVocals: { name: 'Background Vocals' },
        beatboxer: { name: 'Beatboxer' },
        featuredArtist: { name: 'Featured Artist' },
        instrumentDrums: { name: 'Instrument Drums' },
        instrumentPercussion: { name: 'Instrument Percussion' },
        instrumentGuitar: { name: 'Instrument Guitar' },
        instrumentHorns: { name: 'Instrument Horns' },
        instrumentKeys: { name: 'Instrument Keys' },
        instrumentPiano: { name: 'Instrument Piano' },
        instrumentScratches: { name: 'Instrument Scratches' },
        instrumentViolin: { name: 'Instrument Violin' },
        instrumentWoodwind: { name: 'Instrument Woodwind' },
        instrumentFlute: { name: 'Instrument Flute' }
    },

    /**
     * Emotions
     */
    emotions: [
        'Amazing',
        'Angry',
        'Chilled Out',
        'Cool',
        'Energetic',
        'Excited',
        'Fear',
        'Funny',
        'Happy',
        'Hot',
        'Joyful',
        'Fun',
        'Love',
        'No Fear',
        'Numb',
        'Playful',
        'Sad',
        'Sexy',
        'Thoughtful',
        'Trust'
        
        
    ],

    /**
     * Genres
     */
    genres: [
        "Acid",
        "Acid Jazz",
        "Acoustic",
        "Acoustic Blues",
        "Acoustic Folk",
        "Acoustic General",
        "Acoustic Guitar",
        "Acoustic Piano",
        "Acoustic Rock",
        "Acoustic Vocals",
        "Adult Comedy",
        "Adult Contemporary",
        "Alternative",
        "Alternative Country",
        "Alternative General",
        "Alternative Hip Hop",
        "Alternative Metal",
        "Alt Power Pop",
        "Ambient",
        "Americana",
        "Audio Blog",
        "Avant Rock",
        "Baroque",
        "Bass Rap",
        "Battles/Disses",
        "Beach",
        "Beats General",
        "Bebop",
        "Big Beat",
        "Bluegrass",
        "Blues",
        "Blues General",
        "Blues Rock",
        "Bossa Nova",
        "Breakbeat",
        "Brit Pop",
        "Cajun/Zydeco",
        "Chamber Music",
        "Choral",
        "Christian Country",
        "Christian Rap",
        "Christian Rock",
        "Christmas/Seasonal",
        "Classical",
        "Classical General",
        "Classic Rock",
        "Club Bangas",
        "Comedy",
        "Contemporary",
        "Contemporary Christian",
        "Contemporary Gospel",
        "Country",
        "Country and Western",
        "Country Blues",
        "Country General",
        "Country-Pop",
        "Country-Rock",
        "Country Swing",
        "Cover Songs",
        "Crunk",
        "Cuban",
        "Dance",
        "Dance & Electronic",
        "Dancehall",
        "Dance-Punk",
        "Death/Black Metal",
        "Dirty South",
        "Dixieland",
        "Doom Metal",
        "Drum n Bass",
        "Dub",
        "Dubstep",
        "East Coast",
        "EDM",
        "EDM Instrumental",
        "Electric Blues",
        "Electro",
        "Electro-hop",
        "Electronic",
        "Electronica",
        "Emo",
        "Ensembles",
        "Euro",
        "Euro Pop",
        "Experimental",
        "Experimental Sounds",
        "Fictional Stories",
        "Film Music",
        "Flamenco",
        "Folk",
        "Folk Rock",
        "Free Jazz",
        "Freestyle",
        "Funk",
        "Funky R&B",
        "Game & Soundtrack",
        "Games Soundtrack",
        "Gangsta",
        "Garage Rock",
        "General Comedy",
        "General Latin",
        "Gospel",
        "Goth",
        "Goth Metal",
        "Goth Rock",
        "Grime",
        "Grunge",
        "Guitar Rock",
        "Happy Hardcore",
        "Hardcore",
        "Hardcore Rap",
        "Hard Rock",
        "Heavy Metal",
        "Hip Hop",
        "HipHop",
        "Hip Hop - Asian",
        "Hip Hop - Dutch",
        "Hip Hop General",
        "Hip Hop - German",
        "Honky-Tonk",
        "House",
        "Hyphy",
        "IDM",
        "Indie",
        "Indietronic",
        "Industrial",
        "Industrial Metal",
        "Instrumental Rock",
        "Instrumentals",
        "Instrumentals with Hooks",
        "Jazz",
        "Jazz Fusion",
        "Jazz General",
        "Jazz Vocals",
        "Jazzy Beats",
        "J-Pop",
        "Jump Blues",
        "Jungle",
        "Latin",
        "Latin Jazz",
        "Lounge",
        "Mariachi",
        "Medieval",
        "Mellow",
        "Merengue",
        "Metal",
        "Metal Riffs and Licks",
        "Miami Bass",
        "Mid West",
        "Minimal",
        "Modern Jazz",
        "Musical",
        "Music Talk",
        "Native American",
        "Neo-Soul",
        "Nerdcore",
        "New Age",
        "New School",
        "Noise",
        "Nu Jazz",
        "Nu Metal",
        "Old School",
        "On Stage",
        "Opera",
        "Other Alternative",
        "Parody",
        "Poetry",
        "Political Humor",
        "Politics",
        "Pop",
        "Pop/Balada",
        "Pop General",
        "Pop Punk",
        "Pop Rock",
        "Positive Vibes",
        "Post Punk",
        "Power Metal",
        "Power Pop",
        "Prank Calls",
        "Progressive Metal",
        "Progressive Rock",
        "Psychedelic Rock",
        "Punk",
        "Rap",
        "Rap-Metal",
        "R&B",
        "R&B/Soul/Pop",
        "Reggae",
        "Reggae Beats",
        "Reggaeton",
        "Religious",
        "Renaissance",
        "Riffs and Licks",
        "Rock",
        "Rockabilly",
        "Rock En Espanol",
        "Rock General",
        "Rock n Roll",
        "Rock Unplugged",
        "Salsa",
        "Samba",
        "Scratch",
        "Shoegaze",
        "Ska",
        "Smooth",
        "Smooth Jazz",
        "Smooth R&B",
        "Soul",
        "Southern Rock",
        "Spoken Word",
        "Sports",
        "Straight Ahead Blues",
        "Surf Rock",
        "Swing",
        "Symphonic",
        "Talk",
        "Tango",
        "Techno",
        "Techno Hardcore",
        "Thrash Metal",
        "Traditional African",
        "Traditional Arabic",
        "Traditional Asian",
        "Traditional Celtic",
        "Traditional Country",
        "Traditional European",
        "Traditional Hawaiian",
        "Traditional Indian",
        "Traditional Irish",
        "Traditional Spanish",
        "Trance",
        "Trap",
        "Tribal",
        "Trip Hop",
        "Urban",
        "West Coast",
        "World",
        "World Fusion",
        "World General"
    ]
};
