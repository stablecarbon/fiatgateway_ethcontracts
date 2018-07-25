module.exports = async function (token, account, value, minter, is_blacklisted) {
    const proxy = await token.regulator();
    proxy.setWhitelistedUser(account);
    await token.mint(account, value, { from: minter });
    if (is_blacklisted) {
        proxy.setBlacklistedUser(account);
    }
    else {
        proxy.setNonlistedUser(account);
    }
};