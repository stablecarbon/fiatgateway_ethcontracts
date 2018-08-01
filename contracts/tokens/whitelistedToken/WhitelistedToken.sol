pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../permissionedToken/PermissionedToken.sol";
import "../carbonToken/CarbonDollar.sol";

contract WhitelistedToken is PermissionedToken {
    address public cusdAddress; // Address of the CarbonUSD contract.

    /**
        Events
     */
    event MintedToCUSD(address indexed user, uint256 amount);
    event ConvertedToCUSD(address indexed user, uint256 amount);

    /**
    * @notice Constructor sets the regulator proxy contract and the address of the
    * CarbonUSD contract. The latter is necessary in order to make transactions
    * with the CarbonDollar smart contract.
    * @param a Address of allowance sheet. Passed to base constructor.
    * @param b Address of balance sheet. Passed to base constructor.
    * @param _cusd Address of `CarbonDollar` contract
    */
    constructor(address r, address b, address a, address _cusd) PermissionedToken(r,b,a) public {
        require(AddressUtils.isContract(_cusd));
        cusdAddress = _cusd;
    }

    /**
    * @notice Mints CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function mintCUSD(address _to, uint256 _amount) public requiresPermission userWhitelisted(_to) returns (bool) {
        return _mintCUSD(_to, _amount);
    }

    function _mintCUSD(address _to, uint256 _amount) internal returns (bool) {
        require(_to != cusdAddress); // This is to prevent Carbon Labs from printing money out of thin air!
        bool successful = CarbonDollar(cusdAddress).mint(_to, _amount);
        successful = successful && _mint(cusdAddress, _amount);
        emit MintedToCUSD(_to, _amount);
        return successful;
    }

    /**
    * @notice Converts WT0 to CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function convertWT(uint256 _amount) requiresPermission public returns (bool) {
        require(balanceOf(msg.sender) >= _amount);
        _burn(msg.sender, _amount);
        bool mintSuccessful = _mintCUSD(msg.sender, _amount);
        emit ConvertedToCUSD(msg.sender, _amount);
        return mintSuccessful;
    }
}