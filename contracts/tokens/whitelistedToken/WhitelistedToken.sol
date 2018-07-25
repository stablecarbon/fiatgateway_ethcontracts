pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../permissionedToken/PermissionedToken.sol";
import "../carbonToken/CarbonDollar.sol";

contract WhitelistedToken is PermissionedToken {
    using SafeMath for uint256;
    address public cusdAddress; // Address of the CarbonUSD contract.

    /**
        Events
     */
    event BurnedToCUSD(address indexed user, uint256 amount);

    /**
    * @notice Constructor sets the regulator proxy contract and the address of the
    * CarbonUSD contract. The latter is necessary in order to make transactions
    * with the CarbonDollar smart contract.
    * @param _cusd Address of `CarbonDollar` contract
    */
    constructor(address _cusd) public {
        require(AddressUtils.isContract(_cusd));
        cusdAddress = _cusd;
    }

    /**
    * @notice Mints CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @param toCUSD If true, issues the user CarbonUSD. If false, just issues WT0 to the user.
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount, bool toCUSD) public requiresPermission userWhitelisted(_to) returns (bool) {
        return _mint(_to, _amount, toCUSD);
    }

    function _mint(address _to, uint256 _amount, bool toCUSD) internal returns (bool) {
        if (toCUSD) {
            require(_to != cusdAddress); // This is to prevent Carbon Labs from printing money out of thin air!
            bool successful = CarbonDollar(cusdAddress).mint(_to, _amount);
            successful = successful && _mint(cusdAddress, _amount);
            return successful;
        }
        else {
            return _mint(_to, _amount);
        }
    }

    /**
    * @notice Converts WT0 to CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _amount The number of tokens to withdraw
    * @return `true` if successful and `false` if unsuccessful
    */
    function convert(uint256 _amount) senderNotBlacklisted public returns (bool) {
        require(balanceOf(msg.sender) >= _amount);
        _burn(msg.sender, _amount);
        bool mintSuccessful = _mint(msg.sender, _amount, true);
        emit BurnedToCUSD(msg.sender, _amount);
        return mintSuccessful;
    }
}