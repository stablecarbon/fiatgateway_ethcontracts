pragma solidity ^0.4.24;

import "../permissionedToken/PermissionedToken.sol";
import "../carbonToken/CarbonDollar.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";

/**
* @title WhitelistedToken
* @notice A WhitelistedToken can be converted into CUSD and vice versa. Converting a WT into a CUSD
* is the only way for a user to obtain CUSD. This is a permissioned token, so users have to be 
* whitelisted before they can do any mint/burn/convert operation.
*/
contract WhitelistedToken is PermissionedToken {


    address public cusdAddress;

    /**
        Events
     */
    event CUSDAddressChanged(address indexed oldCUSD, address indexed newCUSD);
    event MintedToCUSD(address indexed user, uint256 amount);
    event ConvertedToCUSD(address indexed user, uint256 amount);

    /**
    * @notice Constructor sets the regulator contract and the address of the
    * CarbonUSD meta-token contract. The latter is necessary in order to make transactions
    * with the CarbonDollar smart contract.
    */
    constructor(address _regulator, address _cusd) public PermissionedToken(_regulator) {

        // base class fields
        regulator = Regulator(_regulator);

        cusdAddress = _cusd;

    }

    /**
    * @notice Mints CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _to The address of the receiver
    * @param _amount The number of CarbonTokens to mint to user
    */
    function mintCUSD(address _to, uint256 _amount) public requiresPermission whenNotPaused userNotBlacklisted(_to) {
        return _mintCUSD(_to, _amount);
    }

    /**
    * @notice Converts WT0 to CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _amount The number of Whitelisted tokens to convert
    */
    function convertWT(uint256 _amount) public userNotBlacklisted(msg.sender) whenNotPaused {
        require(balanceOf(msg.sender) >= _amount, "Conversion amount should be less than balance");
        _burn(msg.sender, _amount);
        _mintCUSD(msg.sender, _amount);
        emit ConvertedToCUSD(msg.sender, _amount);
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

    function _mintCUSD(address _to, uint256 _amount) internal {
        require(_to != cusdAddress, "Cannot mint to CarbonUSD contract"); // This is to prevent Carbon Labs from printing money out of thin air!
        CarbonDollar(cusdAddress).mint(_to, _amount);
        _mint(cusdAddress, _amount);
        emit MintedToCUSD(_to, _amount);
    }
}