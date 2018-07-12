pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../permissions/PermissionedToken.sol";
import "../CarbonDollar.sol";

contract WhitelistedToken is PermissionedToken {
    address cusd_addr; // Address of the CarbonUSD contract.

    constructor(address _rProxy, address _cusd) PermissionedToken(_rProxy) public {
        require(AddressUtils.isContract(_cusd));
        cusd_addr = _cusd;
    }

    function initialize(address _cusd) isInitializer("WhitelistedToken", "1.0") public {
        // Nothing to initialize!
    }

    function mint(address _to, uint256 _amount, bool toCUSD) public requiresPermission {
        if (toCUSD) {
            super.mint(cusd_addr, _amount);
            CarbonDollar(cusd_addr).mintCarbonDollar(_to, _amount);
        }
    }
}