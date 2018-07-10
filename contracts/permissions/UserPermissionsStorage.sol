pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";

contract UserPermissionsStorage is Claimable {
    mapping (address => mapping(string => bool)) internal permissions;

    event SetUserPermission(address indexed who, string methodsignature);
    event RemoveUserPermission(address indexed who, string methodsignature);
    
    function setPermission(address _who, string _methodsignature) public onlyOwner {
        permissions[_who][_methodsignature] = true;
        emit SetUserPermission(_who, _permission);
    }

    function getPermission(address _who, string _methodsignature) public onlyOwner returns (bool) {
        return permissions[_who][_methodsignature];
    }

    function removePermission(address _who, string _methodsignature) public onlyOwner {
        permissions[_who][_methodsignature] = true;
        emit RemoveUserPermission(_who, _permission);
    }
}