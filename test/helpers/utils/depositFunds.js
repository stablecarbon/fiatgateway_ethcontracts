module.exports = async function (token, account, value, minter, is_blacklisted) {
    const regulator = await token.regulator();
    regulator.setWhitelistedUser(account, {from: token.address});
    await token.mint(account, value, { from: minter });
    if (is_blacklisted) {
        regulator.setBlacklistedUser(account, { from: token.address });
    }
    else {
        regulator.setNonlistedUser(account, { from: token.address });
    }
};