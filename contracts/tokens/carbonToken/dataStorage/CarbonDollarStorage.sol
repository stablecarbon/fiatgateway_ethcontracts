pragma solidity ^0.4.24;

import "./FeeSheet.sol";
import "./StablecoinWhitelist.sol";

/**
* @title CarbonDollarStorage
* @notice Contains necessary storage contracts for CarbonDollar (FeeSheet and StablecoinWhitelist).
*/
contract CarbonDollarStorage{
    /**
        Storage
    */
    FeeSheet public stablecoinFees;
    StablecoinWhitelist public stablecoinWhitelist;

    /**
    * @dev a CarbonDollarStorage can set its storages only once, on construction
    * @param _feesheet address of the new FeeSheet
    * @param _whitelist address of the new StablecoinWhitelist
    **/
    constructor (address _feesheet, address _whitelist) public {
        stablecoinFees = FeeSheet(_feesheet);
        stablecoinWhitelist = StablecoinWhitelist(_whitelist);
    }
}