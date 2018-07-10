// Used from TrueUSD

pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/ownership/Claimable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

// A wrapper around a depositor mapping.
contract DepositorBasedToken is Claimable {
    DepositSheet depositAccounts;

    /**
    * @dev claim ownership of the balancesheet contract
    * @param _sheet The address to of the balancesheet to claim.
    */
    function setDepositorSheet(address _sheet) public onlyOwner returns (bool){
        depositAccounts = DepositorSheet(_sheet);
        depositAccounts.claimOwnership();
        emit DepositorSheetSet(_sheet);
        return true;
    }

    /**
    * @notice Throws if called by any account that does not have deposit access
    *
    */
    modifier onlyDepositor() {
        require (depositAccounts.depositAccounts[msg.sender]);
        _;
    }
}