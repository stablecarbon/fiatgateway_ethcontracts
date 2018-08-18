pragma solidity ^0.4.24;

import "./CarbonDollarStorage.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import '../../../helpers/Ownable.sol';

/**
* @title MutableCarbonDollarStorage
* @notice Adds mutability to CarbonDollarStorage functions
*/
contract MutableCarbonDollarStorage is Ownable, CarbonDollarStorage {
	/**
        Events
     */
    event FeeSheetChanged(address indexed oldSheet, address indexed newSheet);
    event StablecoinWhitelistChanged(address indexed oldWhitelist, address indexed newWhitelist);

    /**
    * @dev CONSTRUCTOR
    * @param _feesheet address of the new FeeSheet
    * @param _whitelist address of the new StablecoinWhitelist
    **/
    constructor (address _feesheet, address _whitelist) CarbonDollarStorage(_feesheet, _whitelist) public {}

    /**
     * @notice Set the stablecoin whitelist contract.
     * @param _whitelist Address of the stablecoin whitelist contract.
     */
    function setStablecoinWhitelist(address _whitelist) public onlyOwner {
        _setStablecoinWhitelist(_whitelist);
    }

	/**
     * @notice Set the fee sheet for this CarbonUSD.
     * @param _feesheet Address of the fee sheet.
     */
    function setFeeSheet(address _feesheet) public onlyOwner {
        _setFeeSheet(_feesheet);
    }

    function _setFeeSheet(address _feesheet) internal {
        require(_feesheet != address(stablecoinFees), "Must be a new fee sheet");
        require(AddressUtils.isContract(_feesheet), "Must be an actual contract");
        address oldSheet = address(stablecoinFees);
        stablecoinFees = FeeSheet(_feesheet);
        emit FeeSheetChanged(oldSheet, _feesheet);
    }

    function _setStablecoinWhitelist(address _whitelist) internal {
        require(_whitelist != address(stablecoinWhitelist), "Must be a new stablecoin whitelist");
        require(AddressUtils.isContract(_whitelist), "Must be an actual contract");
        address oldWhitelist = address(stablecoinWhitelist);
        stablecoinWhitelist = StablecoinWhitelist(_whitelist);
        emit StablecoinWhitelistChanged(oldWhitelist, _whitelist);
    }
}