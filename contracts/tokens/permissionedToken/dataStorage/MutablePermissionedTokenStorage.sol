pragma solidity ^0.4.23;

import "./PermissionedTokenStorage.sol";
import "openzeppelin-solidity/contracts/AddressUtils.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
* @title MutablePermissionedTokenStorage
* @notice Extends PermissionedTokenStorage by allowing changing the locations 
* of the allowance, balance, and regulator contracts.
*/
contract MutablePermissionedTokenStorage is Ownable, PermissionedTokenStorage {

    // Events
    event ChangedRegulator(address _old, address _new);
    event ChangedBalanceStorage(address _old, address _new);
    event ChangedAllowanceStorage(address _old, address _new);

    constructor (address regulator, address balances, address allowances) PermissionedTokenStorage (regulator, balances, allowances) public {
    }

    /**
    *
    * @dev Only the MutablePermissionedTokenStorageConsumer owner can change its storage location
    * @param _newStorageAddress the new storage address
    *
    */

    function setRegulator(address _newStorageAddress) public onlyOwner {
        require(_newStorageAddress != address(regulator), "Must be a new regulator");
        require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
        address old = address(regulator);
        regulator = Regulator(_newStorageAddress);
        emit ChangedRegulator(old, _newStorageAddress);
    }

    function setBalanceStorage(address _newStorageAddress) public onlyOwner {
        require(_newStorageAddress != address(balances), "Must be a new balance sheet");
        require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
        address old = address(balances);
        balances = BalanceSheet(_newStorageAddress);
        emit ChangedBalanceStorage(old, _newStorageAddress);
    }

    function setAllowanceStorage(address _newStorageAddress) public onlyOwner {
        require(_newStorageAddress != address(allowances), "Must be a new storage sheet");
        require(AddressUtils.isContract(_newStorageAddress), "Cannot set a regulator storage to a non-contract address");
        address old = address(allowances);
        allowances = AllowanceSheet(_newStorageAddress);
        emit ChangedAllowanceStorage(old, _newStorageAddress);
    }
}