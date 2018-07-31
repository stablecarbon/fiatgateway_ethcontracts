pragma solidity ^0.4.23;

import "./FeeSheet.sol";
import "./StablecoinWhitelist.sol";
import 'openzeppelin-solidity/contracts/AddressUtils.sol';
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
*
* @dev A CarbonDollarStorage can upgrade its location
*
*/
contract CarbonDollarStorage is Ownable {
	/**
		Storage
    */
    FeeSheet public stablecoinFees;
    StablecoinWhitelist public stablecoinWhitelist;

	/**
        Events
     */
    event FeeSheetChanged(address indexed oldSheet, address indexed newSheet);
    event StablecoinWhitelistChanged(address indexed oldWhitelist, address indexed newWhitelist);

	/**
    * @dev a PermissionedTokenStorage can set its storages only once, on construction
    *
    **/
    constructor (address feeSheet, address whitelist) public {
    	stablecoinFees = FeeSheet(feeSheet);
    	stablecoinWhitelist = StablecoinWhitelist(whitelist);
    }

    /**
     * @notice Set the stablecoin whitelist contract.
     * @param _whitelist Address of the stablecoin whitelist contract.
     */
    function setStablecoinWhitelist(address _whitelist) public onlyOwner {
        _setStablecoinWhitelist(_whitelist);
    }

    function _setStablecoinWhitelist(address _whitelist) internal {
        require(AddressUtils.isContract(_whitelist));
        address oldWhitelist = address(stablecoinWhitelist);
        stablecoinWhitelist = StablecoinWhitelist(_whitelist);
        emit StablecoinWhitelistChanged(oldWhitelist, _whitelist);
    }

	/**
     * @notice Set the fee sheet for this CarbonUSD.
     * @param _sheet Address of the fee sheet.
     */
    function setFeeSheet(address _sheet) public onlyOwner {
        _setFeeSheet(_sheet);
    }

    function _setFeeSheet(address _sheet) internal {
        require(AddressUtils.isContract(_sheet));
        address oldSheet = address(stablecoinFees);
        stablecoinFees = FeeSheet(_sheet);
        emit FeeSheetChanged(oldSheet, _sheet);
    }
}