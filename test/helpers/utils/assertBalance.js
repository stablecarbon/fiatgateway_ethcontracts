module.exports = async function (token, account, value) {
	let balance = await token.balanceOf(account);
	assert(balance.eq(value));
};
