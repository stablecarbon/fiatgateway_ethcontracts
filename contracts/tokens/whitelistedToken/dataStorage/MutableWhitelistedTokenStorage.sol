pragma solidity ^0.4.24;

import "./WhitelistedTokenStorage.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import '../../../helpers/Ownable.sol';

/**
* @title MutableWhitelistedTokenStorage
* @notice Adds mutability to WhitelistedTokenStorage (cusd can be changed.)
*/
contract MutableWhitelistedTokenStorage is Ownable, WhitelistedTokenStorage {
	/**
        Events
     */
    event CUSDAddressChanged(address indexed oldCUSD, address indexed newCUSD);

    constructor (address cusd) WhitelistedTokenStorage(cusd) public {}

    /**
     * @notice Change the cusd address.
     * @param _cusd the cusd address.
     */
    function setCUSDAddress(address _cusd) public onlyOwner {
        _setCUSDAddress(_cusd);
    }

    function _setCUSDAddress(address _cusd) internal {
        require(_cusd != address(cusdAddress), "Must be a new cusd address");
        require(AddressUtils.isContract(_cusd), "Must be an actual contract");
        address oldCUSD = address(cusdAddress);
        cusdAddress = _cusd;
        emit CUSDAddressChanged(oldCUSD, _cusd);
    }
}