pragma solidity ^0.4.24;

import '../../../helpers/Ownable.sol';
import "openzeppelin-solidity/contracts/AddressUtils.sol";

/**
* @title WhitelistedTokenStorage
* @notice Contains necessary storage contracts for WhitelistedToken.
*/
contract WhitelistedTokenStorage is Ownable {
    
    /**
        Events
     */
    event CUSDAddressChanged(address indexed oldCUSD, address indexed newCUSD);

    /**
        Storage
    */
    address public cusdAddress;

    /**
    * @dev a WhitelistedTokenStorage can set its storages only once, on construction
    *
    **/
    constructor (address _cusdAddress) public {
        cusdAddress = _cusdAddress;
    }

    /**
     * @notice Change the cusd address.
     * @param _cusd the cusd address.
     */
    function setCUSDAddress(address _cusd) public onlyOwner {
        require(_cusd != address(cusdAddress), "Must be a new cusd address");
        require(AddressUtils.isContract(_cusd), "Must be an actual contract");
        address oldCUSD = address(cusdAddress);
        cusdAddress = _cusd;
        emit CUSDAddressChanged(oldCUSD, _cusd);
    }
}