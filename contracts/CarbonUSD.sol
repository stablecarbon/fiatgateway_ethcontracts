pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
* @title CarbonUSD
* @dev The CarbonDollar contract may change over time, so this proxy serves as a
* pointer to the latest version.
*
*/
contract CarbonUSD is AdminUpgradeabilityProxy {}