class BalanceError extends Error {
	constructor(...args) {
		super(...args)
		Error.captureStackTrace(this, BalanceError)
	}
}

module.exports = async function (token, account, value) {
	let balance = await token.balanceOf(account);
	try {
		assert(balance.eq(value));
	}
	catch {
		throw new BalanceError(`Expected balance to be ${value}, was ${balance} instead`);
	}
};
