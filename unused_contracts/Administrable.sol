pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Administrable
 * @dev Contract that provides multi-administrator capability to other contracts.
 * Credit: https://ethereum.stackexchange.com/questions/39654/smart-contract-multiple-owners
 */
contract Administrable is Ownable {
    mapping (address => bool) isAdmin;

    modifier onlyAdmin() {
        require(isAdmin[msg.sender] || owner == msg.sender);
        _;
    }

    function addAdmin(address _toAdd) onlyOwner public {
        require(_toAdd != 0);
        isAdmin[_toAdd] = true;
    }

    function removeAdmin(address _toRemove) onlyOwner public {
        require(_toRemove != 0);
        require(_toRemove != msg.sender);
        isAdmin[_toRemove] = false;
    }
}