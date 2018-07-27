pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./dataStorage/RegulatorStorage.sol";

contract RegulatorProxy is RegulatorStorage, AdminUpgradeabilityProxy {


	constructor( address _implementation ) AdminUpgradeabilityProxy( _implementation ) public {

	}

}