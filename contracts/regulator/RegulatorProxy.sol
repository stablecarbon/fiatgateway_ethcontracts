pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";
import "./dataStorage/MutableRegulatorStorageConsumer.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract RegulatorProxy is AdminUpgradeabilityProxy, MutableRegulatorStorageConsumer, Ownable {


	constructor( address _implementation ) AdminUpgradeabilityProxy( _implementation ) public {
	}

}