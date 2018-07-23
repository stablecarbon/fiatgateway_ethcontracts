pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DataMigratable is Ownable {
    /** @dev Migration function. Will probably have to call
        - transferStorageOwnership() in order to transfer storages from the previous contract
        - claimSO() in order to claim storages
    */
    function migrate(address _oldObj) public;
    /**
        @dev Allows an external call to the contract for causing it to claim ownership
        of its storages.
     */
    function claimStorageOwnership() public onlyOwner {
        claimSO();
    }
    /**
        @dev Allows the contract to internally claim its storages.
     */
    function claimSO() internal;
    /**
        @dev Allows an external call to the contract to initiate a transfer of its storages
        to the message sender (usually another contract.)
     */
    function transferStorageOwnership() public onlyOwner {
        transferSO(msg.sender);
    }
    /**
        @dev Allows the contract to internally transfer storages to a new owner.
     */
    function transferSO(address owner) internal;
}