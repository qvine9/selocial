/**
 * Payment gateway secret key
 */
config.stripePrivateKey = 'sk_test_A7dSKVvLbuhXCGXNN89iOWvt';// 'sk_live_dt2xHG6pLwPzpp00ZBtF3rJ2'

/**

* Exchange rate of credits (1 credit = ??? USD)
 */
config.creditInUsd = 1.0;

/**
 * Selocial commission percentage + fees
 */
config.selocialCommissionPercentage = 15;

/**
 * Mechanicals amount in credits
 */
config.mechanicalsAmount = (0.091 /* USD */) / config.creditInUsd;

/**
 * Does the mix creator get his commission (as mix creator) if he's also the owner of the tracks in the mix?
 */
config.mixCreatorGetsCommissionIfAuthor = false;

/**
 * If a mix without any tracks (e.g. video) gets tipped, should the mix creator get all 80% of the tip?
 */
config.mixCreatorGetsTheRest = false;

/**
 * Commission percentages
 */
config.commissions = {
    tip: {
        mix: {
            mixCreator: 5,  // mix creator gets this when a mix is tipped
            affiliate: 0  // affiliate partner gets this when a mix is tipped
        },
        track: {
            mixCreator: 0, // mix creator gets this when a track in his mix gets tipped
            affiliate: 0 //  affiliate partner gets this when a track gets tipped
        }
    },
    buy: {
        track: {
            mixCreator: 5,  // mix creator gets this when a track in his mix is bought
            affiliate: 0  // affiliate partner gets this when a track is bought
        }
    }
};

/**
 * Tax settings
 *
 * COUNTRY / REGION / [download|tip]
 */
config.taxSettings = {
    US: {
        AL: { download: 4 },
        AZ: { download: 5.6 },
        CO: { download: 2.9 },
        CT: { download: 1 },
        HI: { download: 4 },
        ID: { download: 6 },
        IN: { download: 7 },
        KY: { download: 6 },
        LA: { download: 5 },
        ME: { download: 5.5 },
        MN: { download: 6.875 },
        MS: { download: 7 },
        NE: { download: 5.5 },
        NJ: { download: 6.875 },
        NM: { download: 5.125 },
        NC: { download: 4.75 },
        OH: { download: 5.75 },
        PA: { download: 6 },
        SD: { download: 4.5 },
        TN: { download: 7 },
        TX: { download: 6.25 },
        UT: { download: 4.7 },
        VT: { download: 6 },
        WA: { download: 6.5 },
        WI: { download: 5 },
        WY: { download: 4 }
    }
};
