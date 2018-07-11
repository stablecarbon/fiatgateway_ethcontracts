pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
* @title CarbonDollarProxy
* @dev The CarbonUSD contract may change over time, so this proxy serves as a
* pointer to the latest version.
*
*/
contract CarbonDollarProxy is AdminUpgradeabilityProxy {}