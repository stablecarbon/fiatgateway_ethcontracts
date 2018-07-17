pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

contract UserPermissionsStorage is Claimable {
    /**
     * Mappings
     */
    // (user address => (methodsignature => does user have permission to execute it?))
    mapping (address => mapping(bytes4 => bool)) public hasPermission;

    /**
     * Events
     */
    event SetUserPermission(address indexed who, bytes4 methodsignature);
    event RemovedUserPermission(address indexed who, bytes4 methodsignature);
    
    /**
    * @notice Sets a permission in the list of permissions that a user has.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function setPermission(address _who, bytes4 _methodsignature) public onlyOwner {
        hasPermission[_who][_methodsignature] = true;
        emit SetUserPermission(_who, _methodsignature);
    }

    /**
    * @notice Removes a permission from the list of permissions that a user has.
    * @param _methodsignature Signature of the method that this permission controls.
    */
    function removePermission(address _who, bytes4 _methodsignature) public onlyOwner {
        hasPermission[_who][_methodsignature] = false;
        emit RemovedUserPermission(_who, _methodsignature);
    }
}