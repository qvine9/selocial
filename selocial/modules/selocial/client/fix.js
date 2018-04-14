/**
 * General fixes
 */

Accounts._hashPassword = function (password) {
    return {
    //digest: SHA256(password),
        digest: password,
        algorithm: "sha-256"
    };
};