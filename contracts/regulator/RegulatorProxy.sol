pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./dataStorage/MutableRegulatorStorageConsumer.sol";

contract RegulatorProxy is MutableRegulatorStorageConsumer, AdminUpgradeabilityProxy {


	constructor( address _implementation ) AdminUpgradeabilityProxy( _implementation ) public {
	}

}