pragma solidity ^0.4.23;

import "../regulator/mocks/PermissionSheetMock.sol";

/**
*
* @dev PermissionSheetMockFactory creates new PermissionSheet contracts instantiated with data stores. 
*
**/
contract PermissionSheetMockFactory {
    // Parameters
    address[] public permissionSheets;

    // Events
    event CreatedPermissionSheet(address newPermissionSheet, uint index);

    // Return number of token proxy contracts created so far
    function getCount() public view returns (uint) {
        return permissionSheets.length;
    }

    // Return the i'th created token
    function getPermissionSheet(uint i) public view returns(address) {
        require((i < permissionSheets.length) && (i >= 0), "Invalid index");
        return permissionSheets[i];
    }

    /**
    *
    * @dev Generate new permission sheet.
    *
    **/
    function createPermissionSheet() public {
        // Store new data storage contracts for token proxy
        address permissionSheet = address(new PermissionSheetMock()); 
        permissionSheets.push(permissionSheet);
        emit CreatedPermissionSheet(permissionSheet, permissionSheets.length - 1);
    }
}
