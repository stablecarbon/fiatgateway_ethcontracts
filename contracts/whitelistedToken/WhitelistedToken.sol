pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "../permissionedToken/PermissionedToken.sol";
import "../CarbonDollar.sol";

contract WhitelistedToken is PermissionedToken {
    address cusd_addr; // Address of the CarbonUSD contract.

    /**
    * @notice Constructor sets the regulator proxy contract and the address of the
    * CarbonUSD contract. The latter is necessary in order to make transactions
    * with the CarbonDollar smart contract.
    * @param _rProxy Address of `RegulatorProxy` contract
    */
    constructor(address _rProxy, address _cusd) PermissionedToken(_rProxy) public {
        require(AddressUtils.isContract(_cusd));
        cusd_addr = _cusd;
    }

    /**
    * @notice Function used as part of Migratable interface. Must be called when
    * proxy is assigned to contract in order to correctly assign the contract's
    * version number.
    *
    * If deploying a new contract version, the version number must be changed as well. 
    */
    function initialize(address _cusd) isInitializer("WhitelistedToken", "1.0") public {
        // Nothing to initialize!
    }

    /**
    * @notice Mints CarbonUSD for the user. Stores the WT0 that backs the CarbonUSD
    * into the CarbonUSD contract's escrow account.
    * @param _to The address of the receiver
    * @param _amount The number of tokens to withdraw
    * @param toCUSD If true, issues the user CarbonUSD. If false, just issues WT0 to the user.
    * @return `true` if successful and `false` if unsuccessful
    */
    function mint(address _to, uint256 _amount, bool toCUSD) public requiresPermission returns (bool) {
        if (toCUSD) {
            bool successful = CarbonDollar(cusd_addr).mintCarbonDollar(_to, _amount);
            successful = successful && super.mint(cusd_addr, _amount);
            return successful;
        }
        else {
            return super.mint(_to, _amount);
        }
    }
}