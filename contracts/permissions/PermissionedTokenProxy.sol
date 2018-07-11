pragma solidity ^0.4.23;

import "zos-lib/contracts/upgradeability/AdminUpgradeabilityProxy.sol";

/**
* @title PermissionedTokenProxy
* @dev Token contracts may change over time, so this proxy serves as a
* pointer to the latest version.
*
*/
contract PermissionedTokenProxy is AdminUpgradeabilityProxy {
    event RegulatorUserPermissionsMigrated(address oldRegulator, address newRegulator);
    event RegulatorPermissionStorageMigrated(address oldRegulator, address newRegulator);

    function migrateAllRegulatorData(address _oldRegulatorAddr) public onlyOwner {
        migrateUserPermissionsStorage(_oldRegulatorAddr);
        migratePermissionStorage(_oldRegulatorAddr);
    }

    /**
    * @notice Migrates user permission data from a regulator address to the current regulator
    * @param _oldRegulatorAddr Address of old `Regulator` contract
    */
    function migrateUserPermissionsStorage(address _oldRegulatorAddr) public onlyOwner {
        Regulator oldRegulator = Regulator(_oldRegulatorAddr);
        address oldPermissions = address(oldRegulator.userPermissions);
        Regulator newRegulator = Regulator(implementation());
        newRegulator.setUserPermissionsStorage(oldPermissions);
        emit RegulatorUserPermissionsMigrated(_oldRegulatorAddr, RegulatorProxy(rProxy).implementation());
    }

    /**
    * @notice Migrates permission type data from a regulator address to the current regulator
    * @param _oldRegulatorAddr Address of old `Regulator` contract
    */
    function migratePermissionStorage(address _oldRegulatorAddr) public onlyOwner {
        Regulator oldRegulator = Regulator(_oldRegulatorAddr);
        address oldPermissions = address(oldRegulator.availablePermissions);
        Regulator newRegulator = Regulator(implementation());
        newRegulator.setPermissionStorage(oldPermissions);
        emit RegulatorUserPermissionsMigrated(_oldRegulatorAddr, RegulatorProxy(rProxy).implementation());
    }
}