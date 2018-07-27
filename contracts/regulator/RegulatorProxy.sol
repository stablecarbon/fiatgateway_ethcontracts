pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./dataStorage/Storage.sol";

contract RegulatorProxy is Storage, AdminUpgradeabilityProxy {


	constructor( address _implementation ) AdminUpgradeabilityProxy( _implementation ) public {

	}

}