// Used from TrueUSD

pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around a depositor mapping.
contract DepositorSheet is Claimable {
    using SafeMath for uint256;

    event DepositorAdded(address depositor);
    event DepositorRemoved(address depositor);

    mapping (address => bool) public depositAccounts;

    /**
    * @notice Add a depositor who has access to burn tokens
    * @param _depositor Address to add
    */
    function addDepositor(address _depositor) public onlyOwner {
        depositAccounts.addDepositor(_depositor);
        emit DepositorAdded(_depositor);
    }

    /**
    * @notice Remove a depositor who has access to burn tokens
    * @param _depositor Address to remove
    */
    function removeDepositor(address _depositor) public onlyOwner {
        depositAccounts.removeDepositor(_depositor);
        emit DepositorRemoved(_depositor);
    }
}