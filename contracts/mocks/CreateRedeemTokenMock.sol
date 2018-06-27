pragma solidity ^0.4.23;

import "../CreateRedeemToken.sol";

contract CreateRedeemTokenMock is CreateRedeemToken {

	constructor(address initialAccount, uint initialFiatCredits) public {
		fiatCredits[initialAccount] = initialFiatCredits;
	}
}