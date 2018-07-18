pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DataMigratable is Ownable {
    function migrate(address _oldObj) public;
    function claimStorageOwnership() public onlyOwner {
        claimSO();
    }
    function claimSO() internal;
    function transferStorageOwnership() public onlyOwner {
        transferSO(msg.sender);
    }
    function transferSO(address owner) internal;
}