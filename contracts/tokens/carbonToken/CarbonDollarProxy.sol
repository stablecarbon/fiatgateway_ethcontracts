pragma solidity ^0.4.23;

import "./dataStorage/MutableCarbonDollarStorage.sol";
import "../permissionedToken/PermissionedTokenProxy.sol";


contract CarbonDollarProxy is PermissionedTokenProxy, MutableCarbonDollarStorage {

	
	constructor(address _implementation, address regulator, address balances, address allowances, address fees, address stablecoins) PermissionedTokenProxy(_implementation, regulator, balances, allowances) MutableCarbonDollarStorage(fees, stablecoins) public {}


}