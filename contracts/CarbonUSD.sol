pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./CarbonDollar.sol";

/**
* @title CarbonUSD
* @dev The CarbonDollar contract may change over time, so this proxy serves as a
* pointer to the latest version.
*
*/
contract CarbonUSD is Ownable, AdminUpgradeabilityProxy {
    /**
     * @notice Claims ownership of a CarbonDollar contract. Precondition: the
     * previous owner of the CarbonDollar contract already transferred ownership to 
     * this proxy.
     * @param _pToken The address of the CarbonDollar contract.
     */
    function claimOwnership(address _reg) public onlyOwner {
        CarbonDollar(_reg).claimOwnership();
    }
}