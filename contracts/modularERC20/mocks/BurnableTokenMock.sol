pragma solidity ^0.4.23;

import "../ModularBurnableToken.sol";

contract BurnableTokenMock is ModularBurnableToken {
    constructor(address initialAccount, uint initialBalance) public {
        balances = new BalanceSheet();
        balances.setBalance(initialAccount, initialBalance);
        totalSupply_ = initialBalance;
    }
}
