pragma solidity ^0.4.23;

import "./permissions/PermissionedToken.sol";

contract WhitelistedToken is PermissionedToken {
    address CUSD_ADDRESS;
    function mint(address _to, uint256 _amount, bool toCUSD) public requiresPermission {
        super.mint(CUSD_ADDRESS, _amount);
        CarbonDollar(CUSD_ADDRESS).mintCarbonDollar(_to, _amount);
    }
}