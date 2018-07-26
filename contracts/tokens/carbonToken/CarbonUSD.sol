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
}