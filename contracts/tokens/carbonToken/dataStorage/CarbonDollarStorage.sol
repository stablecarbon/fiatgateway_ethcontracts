pragma solidity ^0.4.23;

import "./FeeSheet.sol";
import "./StablecoinWhitelist.sol";

/**
* @title CarbonDollarStorage
* @notice Contains necessary storage contracts for CarbonDollar (FeeSheet and StablecoinWhitelist).
*/
contract CarbonDollarStorage {
	/**
		Storage
    */
    FeeSheet public stablecoinFees;
    StablecoinWhitelist public stablecoinWhitelist;

	/**
    * @dev a CarbonDollarStorage can set its storages only once, on construction
    *
    **/
    constructor (address feeSheet, address whitelist) public {
    	stablecoinFees = FeeSheet(feeSheet);
    	stablecoinWhitelist = StablecoinWhitelist(whitelist);
    }
}